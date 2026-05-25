const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/school_board';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error.message);
    console.error('Please ensure MONGODB_URI in backend/.env is set to a valid Atlas or local MongoDB connection string.');
    console.error('If using Atlas, verify the cluster host, username, password, and that your current IP is allowed in Atlas Network Access, or allow access from 0.0.0.0/0.');
    process.exit(1);
  }
};

module.exports = connectDB;
