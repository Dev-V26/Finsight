import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      "MONGODB_URI is missing. Create backend/.env with MONGODB_URI=mongodb://127.0.0.1:27017/finsight"
    );
  }

  mongoose.set("strictQuery", true);

  try {
    await mongoose.connect(uri);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err?.message || err);
    throw err;
  }
}
