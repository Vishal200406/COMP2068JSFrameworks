const LocalStrategy =
  require('passport-local').Strategy;

const GitHubStrategy =
  require('passport-github2').Strategy;

const User = require('../models/user');

/**
 * Normalize a text value received from an authentication provider.
 *
 * @param {unknown} value Untrusted profile value.
 * @param {number} maximumLength Maximum stored length.
 * @returns {string} Normalized text.
 */
function normalizeProfileText(value, maximumLength) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().slice(0, maximumLength);
}

/**
 * Determine whether all required GitHub OAuth settings are available.
 *
 * @returns {boolean} True when GitHub authentication can be enabled.
 */
function githubConfigurationIsAvailable() {
  return Boolean(
    process.env.GITHUB_CLIENT_ID &&
      process.env.GITHUB_CLIENT_SECRET &&
      process.env.GITHUB_CALLBACK_URL
  );
}

/**
 * Build a safe display name from a GitHub profile.
 *
 * @param {Object} profile Passport GitHub profile.
 * @returns {string} Display name for TutorConnect.
 */
function getGitHubDisplayName(profile) {
  const profileDisplayName =
    normalizeProfileText(profile.displayName, 80);

  if (profileDisplayName) {
    return profileDisplayName;
  }

  const githubUsername =
    normalizeProfileText(profile.username, 80);

  if (githubUsername) {
    return githubUsername;
  }

  return 'GitHub User';
}

/**
 * Read an avatar URL from a GitHub profile.
 *
 * @param {Object} profile Passport GitHub profile.
 * @returns {string} GitHub avatar URL or an empty string.
 */
function getGitHubAvatarUrl(profile) {
  if (
    !Array.isArray(profile.photos) ||
    !profile.photos[0]
  ) {
    return '';
  }

  return normalizeProfileText(
    profile.photos[0].value,
    500
  );
}

/**
 * Configure local and GitHub Passport authentication.
 *
 * @param {import('passport')} passport Passport instance.
 * @returns {{githubEnabled: boolean}} Enabled authentication methods.
 */
function configurePassport(passport) {
  /**
   * Authenticate locally using an email address and password.
   */
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password'
      },
      async function verifyLocalUser(
        email,
        password,
        done
      ) {
        try {
          const normalizedEmail =
            typeof email === 'string'
              ? email.trim().toLowerCase()
              : '';

          if (!normalizedEmail || !password) {
            return done(null, false, {
              message:
                'Enter both an email address and password.'
            });
          }

          /*
           * passwordHash is excluded from ordinary queries and is
           * selected only when verifying a local login.
           */
          const user = await User.findOne({
            email: normalizedEmail,
            authProvider: 'local'
          })
            .select('+passwordHash')
            .exec();

          /*
           * Use the same message for an unknown account and an
           * incorrect password.
           */
          if (!user) {
            return done(null, false, {
              message:
                'Incorrect email address or password.'
            });
          }

          const passwordMatches =
            await user.verifyPassword(password);

          if (!passwordMatches) {
            return done(null, false, {
              message:
                'Incorrect email address or password.'
            });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  const githubEnabled =
    githubConfigurationIsAvailable();

  if (githubEnabled) {
    /**
     * Authenticate users through their GitHub identity.
     *
     * The application stores the stable GitHub profile ID instead of
     * storing the OAuth access token.
     */
    passport.use(
      new GitHubStrategy(
        {
          clientID:
            process.env.GITHUB_CLIENT_ID,

          clientSecret:
            process.env.GITHUB_CLIENT_SECRET,

          callbackURL:
            process.env.GITHUB_CALLBACK_URL
        },
        async function verifyGitHubUser(
          accessToken,
          refreshToken,
          profile,
          done
        ) {
          try {
            const githubId =
              normalizeProfileText(profile.id, 100);

            if (!githubId) {
              return done(
                new Error(
                  'GitHub did not provide a valid profile ID.'
                )
              );
            }

            const githubUsername =
              normalizeProfileText(
                profile.username,
                100
              );

            const displayName =
              getGitHubDisplayName(profile);

            const avatarUrl =
              getGitHubAvatarUrl(profile);

            let user = await User.findOne({
              githubId: githubId,
              authProvider: 'github'
            }).exec();

            if (!user) {
              user = new User({
                displayName: displayName,
                githubId: githubId,
                githubUsername:
                  githubUsername || undefined,
                avatarUrl:
                  avatarUrl || undefined,
                authProvider: 'github'
              });
            } else {
              /*
               * Refresh profile information in case the GitHub user
               * changed their display name, username, or avatar.
               */
              user.displayName = displayName;

              user.githubUsername =
                githubUsername || undefined;

              user.avatarUrl =
                avatarUrl || undefined;
            }

            await user.save();

            return done(null, user);
          } catch (error) {
            return done(error);
          }
        }
      )
    );
  }

  /**
   * Store only the MongoDB user ID in the login session.
   */
  passport.serializeUser(
    function serializeUser(user, done) {
      done(null, user.id);
    }
  );

  /**
   * Retrieve the current user from MongoDB for an authenticated
   * request.
   */
  passport.deserializeUser(
    async function deserializeUser(userId, done) {
      try {
        const user = await User.findById(userId)
          .select(
            'displayName email githubId githubUsername ' +
              'avatarUrl authProvider createdAt updatedAt'
          )
          .lean()
          .exec();

        if (!user) {
          return done(null, false);
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  );

  return {
    githubEnabled: githubEnabled
  };
}

module.exports = configurePassport;