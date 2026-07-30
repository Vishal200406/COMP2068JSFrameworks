/**
 * Require an authenticated Passport login session.
 *
 * Authenticated users continue to the protected route. Public users
 * receive a one-time notification and are redirected to the login
 * page.
 *
 * @param {import('express').Request} req Express request.
 * @param {import('express').Response} res Express response.
 * @param {import('express').NextFunction} next Next middleware.
 * @returns {void}
 */
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  req.session.errorMessage =
    'Log in to access the tutor-management area.';

  return res.redirect('/users/login');
}

/**
 * Prevent authenticated users from reopening public authentication
 * pages such as registration and login.
 *
 * This middleware is available for later use where required.
 *
 * @param {import('express').Request} req Express request.
 * @param {import('express').Response} res Express response.
 * @param {import('express').NextFunction} next Next middleware.
 * @returns {void}
 */
function ensureGuest(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  }

  return res.redirect('/tutors/manage');
}

module.exports = {
  ensureAuthenticated: ensureAuthenticated,
  ensureGuest: ensureGuest
};