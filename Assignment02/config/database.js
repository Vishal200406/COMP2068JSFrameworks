const mongoose = require('mongoose');

/**
 * Connect the application to MongoDB using the private connection
 * string stored in the MONGODB_URI environment variable.
 *
 * @returns {Promise<mongoose.Connection>} Active Mongoose connection.
 */
async function connectToDatabase() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error(
      'MONGODB_URI is not defined. Add the MongoDB connection string to the .env file.'
    );
  }

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
    serverSelectionTimeoutMS: 10000
  });

  return mongoose.connection;
}

module.exports = connectToDatabase;