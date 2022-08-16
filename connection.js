// external imports
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// to access .env variables
dotenv.config();

// creating connection with MongoDB
const dbConnect = () => {
  // parameters for connection
  const connectionParams = { useNewUrlParser: true };

  // connecting with MondoDB
  mongoose.connect(process.env.DB_CONNECTION, connectionParams);

  // on connection
  mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB sucessfully');
  });

  // on some error
  mongoose.connection.on('error', (err) => {
    console.log(`Error while connecting to MongoDB :${err}`);
  });

  // on disconnection
  mongoose.connection.on('disconnected', () => {
    console.log('MongoDB connection disconnected');
  });
};

// exporting the connection function
module.exports = dbConnect;
