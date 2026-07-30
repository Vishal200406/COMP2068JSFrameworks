var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var tutorsRouter = require('./routes/tutors');

var app = express();

/**
 * Configure the HBS view engine.
 */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

/**
 * Register application middleware.
 */
app.use(logger('dev'));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: false
  })
);
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Register application routes.
 */
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/tutors', tutorsRouter);

/**
 * Catch requests that do not match an existing route and forward
 * them to the error handler as a 404 error.
 */
app.use(function (req, res, next) {
  next(createError(404));
});

/**
 * Display the application error page.
 */
app.use(function (err, req, res, next) {
  res.locals.message = err.message;

  /*
   * Detailed error information is displayed only during development.
   * Production visitors receive the message without the stack trace.
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