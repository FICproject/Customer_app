const mongoose = require('mongoose');
const dns = require('dns');
require('dotenv').config({ path: '../.env' });

// Ensure DNS servers for resolving MongoDB Atlas SRV records
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // Ignore if not allowed
}

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://karthikeyanb25_db_user:pqbZxh0jH0zNGyKf@cluster0.2gix8jn.mongodb.net/connect_db?retryWrites=true&w=majority&appName=Cluster0";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log(`[MongoDB] Connected to Database: ${conn.connection.name} @ ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn('[MongoDB] Remote connection warning (continuing with offline fallback):', error.message);
    return null;
  }
};

module.exports = connectDB;
