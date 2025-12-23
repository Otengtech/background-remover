import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME || undefined,

      // ✅ REQUIRED for latest MongoDB behavior
      maxPoolSize: 10,          // keep connections alive
      minPoolSize: 1,           // prevent full disconnect
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      heartbeatFrequencyMS: 10000,

      retryWrites: true,
      retryReads: true,
    });

    console.log("✅ MongoDB Connected");

    // ---- Connection Events ----
    mongoose.connection.on("connected", () => {
      console.log("🟢 MongoDB connected");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("🔁 MongoDB reconnected");
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB disconnected");
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB error:", err);
    });

    // ---- Keep connection alive (VERY IMPORTANT) ----
    setInterval(async () => {
      try {
        await mongoose.connection.db.admin().ping();
        console.log("📡 MongoDB ping");
      } catch (err) {
        console.error("❌ MongoDB ping failed", err);
      }
    }, 5 * 60 * 1000); // every 5 minutes

    // ---- Graceful shutdown ----
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("⚠️ MongoDB connection closed (SIGINT)");
      process.exit(0);
    });

  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
};

export default connectDB;
