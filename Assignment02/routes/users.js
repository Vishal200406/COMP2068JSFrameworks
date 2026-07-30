const express = require('express');
const passport = require('passport');

const User = require('../models/user');

const router = express.Router();

/**
 * Normalize an email address before storing or searching for it.
 *
 * @param {unknown} value Submitted email value.
 * @returns {string} Trimmed lowercase email address.
 */
function normalizeEmail(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().toLowerCase();
}

/**
 * Normalize an ordinary text form field.
 *
 * Passwords must not use this helper because spaces may intentionally
 * be part of a user's password.
 *
 * @param {unknown} value Submitted field value.
 * @returns {string} Trimmed field value.
 */
function normalizeText(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

/**
 * Validate local registration information before creating a User.
 *
 * @param {Object} data Registration data.
 * @returns {Array<string>} Validation error messages.
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
 * Convert Mongoose validation errors into messages that can be shown
 * in the registration form.
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
 * Redirect /users to the appropriate authentication page.
 */
router.get('/', function (req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('/tutors');
  }

  return res.redirect('/users/login');
});

/**
 * Display the local account registration page.
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
 * Create a local user account and immediately establish a login
 * session after successful registration.
 */
router.post(
  '/register',
  async function (req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect('/tutors');
    }

    const formData = {
      displayName: normalizeText(req.body.displayName),
      email: normalizeEmail(req.body.email)
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
        displayName: registrationData.displayName,
        email: registrationData.email,
        authProvider: 'local'
      });

      await user.setPassword(
        registrationData.password
      );

      await user.save();

      /*
       * Log the new user in immediately after successful account
       * creation.
       */
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
      /*
       * Handle a duplicate email created during a race between the
       * initial existence check and the database save operation.
       */
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
 * Display the local login page.
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
 * Authenticate a local account using Passport.
 */
router.post(
  '/login',
  function (req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect('/tutors');
    }

    const email = normalizeEmail(req.body.email);

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

    /*
     * A custom Passport callback lets the application preserve the
     * submitted email address and display authentication feedback in
     * the same HBS page.
     */
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
 * End the authenticated login session.
 *
 * Logout uses POST so merely following a link or loading an image
 * cannot log the user out.
 */
router.post(
  '/logout',
  function (req, res, next) {
    req.logout(function (logoutError) {
      if (logoutError) {
        return next(logoutError);
      }

      /*
       * Remove the complete server-side session after Passport has
       * cleared its authentication state.
       */
      req.session.destroy(
        function (sessionError) {
          if (sessionError) {
            return next(sessionError);
          }

          res.clearCookie('tutorconnect.sid');

          return res.redirect('/');
        }
      );
    });
  }
);

module.exports = router;