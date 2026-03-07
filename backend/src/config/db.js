import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error("MONGO_URI is missing in .env");

    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });

    console.log("MongoDB connected");
    console.log("Host:", mongoose.connection.host);
    console.log("DB:", mongoose.connection.name);
  } catch (error) {
    console.error("DB error:", error.message);
    throw error;
  }
};

export default connectDB;