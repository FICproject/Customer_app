const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://karthikeyanb25_db_user:pqbZxh0jH0zNGyKf@cluster0.2gix8jn.mongodb.net/connect_db?retryWrites=true&w=majority&appName=Cluster0";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log(`[MongoDB] Connected to Database: ${conn.connection.name} @ ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('[MongoDB] Connection Failed:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
