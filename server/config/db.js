const mongoose = require("mongoose");

let connected = false;

async function connectDb() {
  if (connected) return mongoose.connection;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is required");
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
  });

  connected = true;
  return mongoose.connection;
}

module.exports = { connectDb };
