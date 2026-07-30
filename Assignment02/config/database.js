const mongoose = require('mongoose');

/*
 * Reuse a connection promise within the same running process.
 *
 * Vercel may reuse a warm function instance for several requests.
 * Caching the promise prevents the application from starting a new
 * Mongoose connection for every request handled by that instance.
 */
let connectionPromise = null;

/**
 * Connect the application to MongoDB Atlas.
 *
 * @returns {Promise<mongoose.Connection>} Active Mongoose connection.
 */
async function connectToDatabase() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error(
      'MONGODB_URI is not defined. Add the MongoDB connection string to the environment variables.'
    );
  }

  /*
   * readyState 1 means Mongoose is already connected.
   */
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  /*
   * Reuse an in-progress connection attempt instead of opening
   * several simultaneous connections.
   */
  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true,
        serverSelectionTimeoutMS: 10000
      })
      .catch(function (error) {
        /*
         * Reset the promise after a failure so a later request can
         * attempt to connect again.
         */
        connectionPromise = null;

        throw error;
      });
  }

  await connectionPromise;

  return mongoose.connection;
}

module.exports = connectToDatabase;