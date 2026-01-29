import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import passport from "passport";
import "./config/passport.js";
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

const server = app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});

mongoose
  .connect(databaseUrl)
  .then(() => {
    console.log("✅ Connected to MongoDB");
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  });

process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    mongoose.connection.close();
    process.exit(0);
  });
});
