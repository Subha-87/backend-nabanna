const mongoose = require("mongoose");

const MONGO_URL = process.env.MONGODB_LOCAL_URI;
const connectDB = async () => {
  try {
    if (!MONGO_URL) {
      throw new Error("MONGO_URL is not defined or Detected");
    } else if (mongoose.connection.readyState === 1) {
      console.log("MONGODB is already Connected");
      return;
    }
    let conn = await mongoose.connect(MONGO_URL);
    console.log(`MongoDB Connection Successfull: ${conn.connection.host}`);
  } catch (error) {
    console.error("DataBase Connection Error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
module.exports.default = connectDB;
