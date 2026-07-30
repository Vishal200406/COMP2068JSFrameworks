const express = require('express');
const passport = require('passport');

const User = require('../models/user');

const router = express.Router();

/**
 * Normalize an email address.
 *
 * @param {unknown} value Submitted email value.
 * @returns {string} Trimmed lowercase email.
 */
function normalizeEmail(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().toLowerCase();
}

/**
 * Normalize an ordinary text field.
 *
 * @param {unknown} value Submitted field value.
 * @returns {string} Trimmed text.
 */
function normalizeText(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

/**
 * Determine whether GitHub authentication is configured.
 *
 * @returns {boolean} True when all GitHub OAuth settings exist.
 */
function githubAuthenticationIsConfigured() {
  return Boolean(
    process.env.GITHUB_CLIENT_ID &&
      process.env.GITHUB_CLIENT_SECRET &&
      process.env.GITHUB_CALLBACK_URL
  );
}

/**
 * Validate local registration information.
 *
 * @param {Object} data Registration data.
 * @returns {Array<string>} Validation errors.
 */
function validateRegistration(data) {
  const errors = [];

  if (!data.displayName) {
    errors.push('Display name is required.');
  } else if (data.displayName.length < 2) {
    errors.push(
      'Display name must contain at least 2 characters.'
    );
  } else if (data.displayName.length > 80) {
    errors.push(
      'Display name cannot exceed 80 characters.'
    );
  }

  if (!data.email) {
    errors.push('Email address is required.');
  } else if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)
  ) {
    errors.push('Enter a valid email address.');
  } else if (data.email.length > 150) {
    errors.push(
      'Email address cannot exceed 150 characters.'
    );
  }

  if (!data.password) {
    errors.push('Password is required.');
  } else {
    if (data.password.length < 8) {
      errors.push(
        'Password must contain at least 8 characters.'
      );
    }

    if (
      Buffer.byteLength(data.password, 'utf8') > 72
    ) {
      errors.push(
        'Password cannot exceed 72 UTF-8 bytes.'
      );
    }
  }

  if (!data.confirmPassword) {
    errors.push('Confirm your password.');
  } else if (
    data.password !== data.confirmPassword
  ) {
    errors.push('The passwords do not match.');
  }

  return errors;
}

/**
 * Convert Mongoose validation errors into readable messages.
 *
 * @param {Error} error Mongoose error.
 * @returns {Array<string>} Validation messages.
 */
function getMongooseValidationMessages(error) {
  if (
    !error ||
    error.name !== 'ValidationError' ||
    !error.errors
  ) {
    return [];
  }

  return Object.keys(error.errors).map(function (field) {
    return error.errors[field].message;
  });
}

/**
 * Redirect the base user route.
 */
router.get('/', function (req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('/tutors');
  }

  return res.redirect('/users/login');
});

/**
 * Display the registration page.
 */
router.get('/register', function (req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('/tutors');
  }

  return res.render('users/register', {
    title: 'Register',
    formData: {
      displayName: '',
      email: ''
    },
    errors: []
  });
});

/**
 * Create a local account and immediately log the user in.
 */
router.post(
  '/register',
  async function (req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect('/tutors');
    }

    const formData = {
      displayName:
        normalizeText(req.body.displayName),

      email:
        normalizeEmail(req.body.email)
    };

    const registrationData = {
      displayName: formData.displayName,
      email: formData.email,

      password:
        typeof req.body.password === 'string'
          ? req.body.password
          : '',

      confirmPassword:
        typeof req.body.confirmPassword === 'string'
          ? req.body.confirmPassword
          : ''
    };

    const validationErrors =
      validateRegistration(registrationData);

    if (validationErrors.length > 0) {
      return res.status(400).render(
        'users/register',
        {
          title: 'Register',
          formData: formData,
          errors: validationErrors
        }
      );
    }

    try {
      const existingUser = await User.findOne({
        email: registrationData.email
      })
        .select('_id')
        .lean()
        .exec();

      if (existingUser) {
        return res.status(409).render(
          'users/register',
          {
            title: 'Register',
            formData: formData,
            errors: [
              'An account already uses this email address.'
            ]
          }
        );
      }

      const user = new User({
        displayName:
          registrationData.displayName,

        email:
          registrationData.email,

        authProvider: 'local'
      });

      await user.setPassword(
        registrationData.password
      );

      await user.save();

      return req.login(
        user,
        function (loginError) {
          if (loginError) {
            return next(loginError);
          }

          req.session.successMessage =
            'Your TutorConnect account was created successfully.';

          return res.redirect('/tutors');
        }
      );
    } catch (error) {
      if (error && error.code === 11000) {
        return res.status(409).render(
          'users/register',
          {
            title: 'Register',
            formData: formData,
            errors: [
              'An account already uses this email address.'
            ]
          }
        );
      }

      const mongooseErrors =
        getMongooseValidationMessages(error);

      if (mongooseErrors.length > 0) {
        return res.status(400).render(
          'users/register',
          {
            title: 'Register',
            formData: formData,
            errors: mongooseErrors
          }
        );
      }

      return next(error);
    }
  }
);

/**
 * Display the login page.
 */
router.get('/login', function (req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('/tutors');
  }

  return res.render('users/login', {
    title: 'Log In',
    email: '',
    errors: []
  });
});

/**
 * Authenticate a local account.
 */
router.post(
  '/login',
  function (req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect('/tutors');
    }

    const email =
      normalizeEmail(req.body.email);

    const password =
      typeof req.body.password === 'string'
        ? req.body.password
        : '';

    if (!email || !password) {
      return res.status(400).render(
        'users/login',
        {
          title: 'Log In',
          email: email,
          errors: [
            'Enter both an email address and password.'
          ]
        }
      );
    }

    return passport.authenticate(
      'local',
      function (error, user, information) {
        if (error) {
          return next(error);
        }

        if (!user) {
          const message =
            information && information.message
              ? information.message
              : 'Incorrect email address or password.';

          return res.status(401).render(
            'users/login',
            {
              title: 'Log In',
              email: email,
              errors: [message]
            }
          );
        }

        return req.login(
          user,
          function (loginError) {
            if (loginError) {
              return next(loginError);
            }

            req.session.successMessage =
              'You are now logged in to TutorConnect.';

            return res.redirect('/tutors');
          }
        );
      }
    )(req, res, next);
  }
);

/**
 * Start GitHub OAuth authentication.
 */
router.get(
  '/github',
  function (req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect('/tutors');
    }

    if (!githubAuthenticationIsConfigured()) {
      req.session.errorMessage =
        'GitHub login is not currently configured.';

      return res.redirect('/users/login');
    }

    /*
     * No repository-related OAuth scopes are requested. TutorConnect
     * uses the returned identity information only to create or locate
     * the application user.
     */
    return passport.authenticate('github')(
      req,
      res,
      next
    );
  }
);

/**
 * Complete GitHub OAuth authentication.
 */
router.get(
  '/github/callback',
  function (req, res, next) {
    if (!githubAuthenticationIsConfigured()) {
      req.session.errorMessage =
        'GitHub login is not currently configured.';

      return res.redirect('/users/login');
    }

    return passport.authenticate(
      'github',
      function (error, user) {
        if (error) {
          return next(error);
        }

        if (!user) {
          req.session.errorMessage =
            'GitHub login was cancelled or could not be completed.';

          return res.redirect('/users/login');
        }

        return req.login(
          user,
          function (loginError) {
            if (loginError) {
              return next(loginError);
            }

            req.session.successMessage =
              'You are now logged in with GitHub.';

            return res.redirect('/tutors');
          }
        );
      }
    )(req, res, next);
  }
);

/**
 * End the authenticated login session.
 */
router.post(
  '/logout',
  function (req, res, next) {
    req.logout(function (logoutError) {
      if (logoutError) {
        return next(logoutError);
      }

      req.session.destroy(
        function (sessionError) {
          if (sessionError) {
            return next(sessionError);
          }

          res.clearCookie(
            'tutorconnect.sid'
          );

          return res.redirect('/');
        }
      );
    });
  }
);

module.exports = router;