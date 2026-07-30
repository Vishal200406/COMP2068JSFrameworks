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
 *
 * The session secret must be stored in .env and must never be
 * committed to the GitHub repository.
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
 * Trust the first reverse proxy in production.
 *
 * Cloud hosts commonly place Express behind a reverse proxy. This
 * setting is required for secure cookies to work correctly there.
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
 * Configure Passport before registering its middleware.
 */
configurePassport(passport);

/**
 * Store application sessions in MongoDB.
 *
 * connect-mongo@3.2.0 reuses the active Mongoose connection created
 * before app.js is loaded in bin/www.
 */
var sessionStore = new MongoStore({
  mongooseConnection: mongoose.connection,
  collection: 'sessions',

  /*
   * Sessions expire after seven days.
   */
  ttl: 7 * 24 * 60 * 60,

  /*
   * Avoid updating an unchanged session in MongoDB more than once
   * during a 24-hour period.
   */
  touchAfter: 24 * 60 * 60,

  /*
   * MongoDB's TTL index removes expired session records.
   */
  autoRemove: 'native'
});

/**
 * Configure Express login sessions.
 *
 * Only the session ID is stored in the browser cookie. Session data
 * itself is stored in the MongoDB sessions collection.
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
 * Initialize Passport and restore authenticated login sessions.
 *
 * Session middleware must appear before Passport session middleware.
 */
app.use(passport.initialize());
app.use(passport.session());

/**
 * Make authentication information available in every HBS view.
 *
 * Later, layout.hbs will use these values to display different
 * navigation links to authenticated and public visitors.
 */
app.use(function exposeAuthenticationState(
  req,
  res,
  next
) {
  res.locals.isAuthenticated =
    req.isAuthenticated();

  res.locals.currentUser =
    req.user || null;

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

  /*
   * Show detailed error information only during development.
   */
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