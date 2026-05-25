const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/school_board';
  try {
    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error.message);
    console.error('Please ensure MongoDB is installed and running locally, or update backend/.env MONGODB_URI to a valid MongoDB connection string.');
    console.error('If you are using local MongoDB, start it with `mongod` or the MongoDB service before running the backend.');
    process.exit(1);
  }
};

module.exports = connectDB;
