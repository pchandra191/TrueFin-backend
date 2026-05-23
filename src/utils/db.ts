import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://taskoo:taskoo123@cluster0.atyrb9v.mongodb.net/trufin?retryWrites=true&w=majority&appName=Cluster0";

export async function connectDB() {
try {
await mongoose.connect(MONGODB_URI, {
serverSelectionTimeoutMS: 30000,
socketTimeoutMS: 45000,
connectTimeoutMS: 30000,
});
console.log("✅ MongoDB connected");
} catch (err) {
console.error("❌ MongoDB connection error:", err);
console.warn("⚠️ Server starting without MongoDB — database features unavailable");
}

mongoose.connection.on("disconnected", () => {
console.log("⚠️ MongoDB disconnected, reconnecting...");
setTimeout(connectDB, 5000);
});

mongoose.connection.on("error", (err) => {
console.error("MongoDB error:", err);
});