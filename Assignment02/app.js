var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var session = require('express-session');
var passport = require('passport');

var MongoStore =
  require('connect-mongo')(session);

var configurePassport =
  require('./config/passport');

var indexRouter =
  require('./routes/index');

var usersRouter =
  require('./routes/users');

var tutorsRouter =
  require('./routes/tutors');

var app = express();

/**
 * Confirm that required private configuration values are available.
 */
if (!process.env.MONGODB_URI) {
  throw new Error(
    'MONGODB_URI is not defined. Add it to the environment variables.'
  );
}

if (!process.env.SESSION_SECRET) {
  throw new Error(
    'SESSION_SECRET is not defined. Add it to the environment variables.'
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
 * Vercel places the Express application behind a reverse proxy.
 *
 * Trusting the first proxy allows secure session cookies to work
 * correctly in production.
 */
if (app.get('env') === 'production') {
  app.set('trust proxy', 1);
}

/**
 * Register request logging, body parsing, and static-file middleware.
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
 * Configure local and GitHub Passport strategies.
 */
var authenticationCapabilities =
  configurePassport(passport);

/**
 * Store login sessions in MongoDB.
 *
 * The session store uses its own MongoDB connection string. This
 * approach works for both the local Express server and Vercel's
 * serverless runtime.
 */
var sessionStore = new MongoStore({
  url: process.env.MONGODB_URI,
  collection: 'sessions',
  ttl: 7 * 24 * 60 * 60,
  touchAfter: 24 * 60 * 60,
  autoRemove: 'native'
});

/**
 * Configure Express login sessions.
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

      /*
       * HTTPS is used by Vercel production deployments.
       */
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
 * Expose authentication information and one-time messages to HBS.
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

  res.locals.githubAuthAvailable =
    authenticationCapabilities.githubEnabled;

  res.locals.successMessage =
    req.session.successMessage || null;

  res.locals.errorMessage =
    req.session.errorMessage || null;

  /*
   * Remove notification messages after one page display.
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
 * Convert unmatched URLs into 404 errors.
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
   * Hide stack traces in the production deployment.
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