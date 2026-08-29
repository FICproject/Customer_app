const mongoose = require('mongoose');

const uri = "mongodb+srv://karthikeyanb25_db_user:pqbZxh0jH0zNGyKf@cluster0.2gix8jn.mongodb.net/connect_db?retryWrites=true&w=majority&appName=Cluster0";

async function testConn() {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(uri);
    console.log("SUCCESS: Connected to MongoDB Atlas (connect_db)!");
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("Collections in connect_db:", collections.map(c => c.name));
    await mongoose.disconnect();
    console.log("Disconnected successfully.");
  } catch (err) {
    console.error("Connection Error:", err);
  }
}

testConn();
