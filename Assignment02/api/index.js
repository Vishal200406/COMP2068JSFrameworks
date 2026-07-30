/**
 * Vercel serverless entry point for TutorConnect Directory.
 *
 * Local development continues to use bin/www through npm start.
 * Vercel invokes this file for production web requests.
 */
require('dotenv').config({
  quiet: true
});

const connectToDatabase =
  require('../config/database');

/*
 * Cache the application-loading promise inside a warm Vercel
 * function instance.
 */
let applicationPromise = null;

/**
 * Connect to MongoDB and load the Express application.
 *
 * app.js is required only after Mongoose establishes its connection.
 *
 * @returns {Promise<import('express').Express>} Express application.
 */
function loadApplication() {
  if (!applicationPromise) {
    applicationPromise =
      connectToDatabase()
        .then(function () {
          return require('../app');
        })
        .catch(function (error) {
          /*
           * Allow another connection attempt after a failed startup.
           */
          applicationPromise = null;

          throw error;
        });
  }

  return applicationPromise;
}

/**
 * Handle an incoming Vercel Function request.
 *
 * @param {import('http').IncomingMessage} req Incoming request.
 * @param {import('http').ServerResponse} res Outgoing response.
 * @returns {Promise<void>}
 */
module.exports = async function handler(
  req,
  res
) {
  try {
    const app =
      await loadApplication();

    return app(req, res);
  } catch (error) {
    console.error(
      'TutorConnect Vercel startup failed:'
    );

    console.error(error);

    if (!res.headersSent) {
      res.statusCode = 500;

      res.setHeader(
        'Content-Type',
        'text/plain; charset=utf-8'
      );

      res.end(
        'TutorConnect could not start. Review the Vercel function logs.'
      );
    }
  }
};