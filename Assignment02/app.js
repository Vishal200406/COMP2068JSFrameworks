var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var session = require('express-session');
var passport = require('passport');
var mongoose = require('mongoose');

var MongoStore =
  require('connect-mongo')(session);

var configurePassport =
  require('./config/passport');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var tutorsRouter = require('./routes/tutors');

var app = express();

/**
 * Confirm that the private session secret is available.
 */
if (!process.env.SESSION_SECRET) {
  throw new Error(
    'SESSION_SECRET is not defined. Add it to the .env file.'
  );
}

/**
 * Configure the HBS view engine.
 */
app.set(
  'views',
  path.join(__dirname, 'views')
);

app.set('view engine', 'hbs');

/**
 * Trust the first reverse proxy in production so secure cookies work
 * correctly when the application is deployed behind a cloud proxy.
 */
if (app.get('env') === 'production') {
  app.set('trust proxy', 1);
}

/**
 * Register request-parsing and static-file middleware.
 */
app.use(logger('dev'));

app.use(express.json());

app.use(
  express.urlencoded({
    extended: false
  })
);

app.use(
  express.static(
    path.join(__dirname, 'public')
  )
);

/**
 * Configure Passport strategies and serialization.
 */
configurePassport(passport);

/**
 * Store Express sessions in MongoDB.
 */
var sessionStore = new MongoStore({
  mongooseConnection: mongoose.connection,
  collection: 'sessions',
  ttl: 7 * 24 * 60 * 60,
  touchAfter: 24 * 60 * 60,
  autoRemove: 'native'
});

/**
 * Configure login sessions and the browser session cookie.
 */
app.use(
  session({
    name: 'tutorconnect.sid',
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure:
        app.get('env') === 'production',
      maxAge:
        7 * 24 * 60 * 60 * 1000
    }
  })
);

/**
 * Initialize Passport and restore authenticated users from sessions.
 */
app.use(passport.initialize());
app.use(passport.session());

/**
 * Expose authentication and one-time notification information to all
 * HBS views.
 */
app.use(function exposeViewInformation(
  req,
  res,
  next
) {
  res.locals.isAuthenticated =
    req.isAuthenticated();

  res.locals.currentUser =
    req.user || null;

  res.locals.successMessage =
    req.session.successMessage || null;

  res.locals.errorMessage =
    req.session.errorMessage || null;

  /*
   * Delete notification messages after exposing them once. This gives
   * the application simple flash-message behaviour.
   */
  delete req.session.successMessage;
  delete req.session.errorMessage;

  next();
});

/**
 * Register application routes.
 */
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/tutors', tutorsRouter);

/**
 * Convert unmatched requests into 404 errors.
 */
app.use(function handleNotFound(
  req,
  res,
  next
) {
  next(createError(404));
});

/**
 * Display the shared application error page.
 */
app.use(function handleApplicationError(
  err,
  req,
  res,
  next
) {
  res.locals.message = err.message;

  res.locals.error =
    req.app.get('env') === 'development'
      ? err
      : {};

  res.status(err.status || 500);

  res.render('error', {
    title: 'Application Error'
  });
});

module.exports = app;