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
    console.error('Please ensure MONGODB_URI in backend/.env is set to a valid Atlas or local MongoDB connection string.');
    console.error('For Atlas, use a connection string like: mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/school_board?retryWrites=true&w=majority');
    process.exit(1);
  }
};

module.exports = connectDB;
