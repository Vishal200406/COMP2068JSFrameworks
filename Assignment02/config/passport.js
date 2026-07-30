const LocalStrategy = require('passport-local').Strategy;

const User = require('../models/user');

/**
 * Configure all Passport authentication strategies and session
 * serialization behaviour.
 *
 * @param {import('passport')} passport Passport instance used by
 * the Express application.
 */
function configurePassport(passport) {
  /**
   * Authenticate local users using an email address and password.
   *
   * The form field named "email" is treated as the username field.
   */
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password'
      },
      async function verifyLocalUser(email, password, done) {
        try {
          const normalizedEmail =
            typeof email === 'string'
              ? email.trim().toLowerCase()
              : '';

          if (!normalizedEmail || !password) {
            return done(null, false, {
              message: 'Enter both an email address and password.'
            });
          }

          /*
           * passwordHash is excluded from normal User queries.
           * It is selected explicitly only when verifying a login.
           */
          const user = await User.findOne({
            email: normalizedEmail,
            authProvider: 'local'
          })
            .select('+passwordHash')
            .exec();

          /*
           * Use the same message for an unknown email and an incorrect
           * password. This avoids revealing whether an account exists.
           */
          if (!user) {
            return done(null, false, {
              message: 'Incorrect email address or password.'
            });
          }

          const passwordMatches =
            await user.verifyPassword(password);

          if (!passwordMatches) {
            return done(null, false, {
              message: 'Incorrect email address or password.'
            });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  /**
   * Store only the MongoDB user ID in the Passport login session.
   *
   * @param {Object} user Authenticated User document.
   * @param {Function} done Passport serialization callback.
   */
  passport.serializeUser(function serializeUser(user, done) {
    done(null, user.id);
  });

  /**
   * Retrieve the current user from MongoDB on authenticated requests.
   *
   * Password hashes remain excluded because passwordHash has
   * select: false in the User schema.
   *
   * @param {string} userId MongoDB ID stored in the session.
   * @param {Function} done Passport deserialization callback.
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
}

module.exports = configurePassport;