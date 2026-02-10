import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import passport from "passport";
import "./config/passport.js";
import "./config/redis.js";
import { initNATS } from "./config/natsClient.js";
import routes from "./routes/index.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;
const databaseUrl = process.env.DATABASE_URL;

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

app.use(passport.initialize());
app.use("/api", routes);

const startServer = async () => {
  try {
    await mongoose.connect(databaseUrl);
    console.log("✅ Connected to MongoDB");

    await initNATS();

    app.listen(port, () => {
      console.log(`🚀 Server running on port: ${port}`);
    });  
  } catch (error) {
    console.error("❌ Critical Startup Error:", error);
    process.exit(1);
  }
};

startServer();

process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  mongoose.connection.close();
  process.exit(0);
});
