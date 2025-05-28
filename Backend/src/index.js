import express from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import songsRoutes from "./routes/songs.routes.js";
import albumRoutes from "./routes/album.routes.js";
import statRoutes from "./routes/stat.route.js";
import { connect } from "mongoose";
import { connectDB } from "./lib/db.js";
import { clerkMiddleware } from '@clerk/express'
import fileUpload from "express-fileupload"
import path from "path"
import cors from "cors";
import { createServer } from "http";
import { initializeSocket } from "./lib/socket.js";


dotenv.config();
const app = express();
const __dirname = path.resolve();
const port = process.env.PORT;


const httpServer= createServer(app);
initializeSocket(httpServer);
const allowedOrigins = [
  "http://localhost:3000",
  "https://music-rmhh.vercel.app",  // ✅ your frontend on Vercel
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));;

app.use(express.json()); // Parse JSON data in req.body
app.use(clerkMiddleware()); // Adds auth info to req (like user id)

app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: path.join(__dirname, "temp"),
  createParentPath: true,
  limits: { fileSize: 10 * 1024 * 1024 },
}));

// API routes
app.use("/", userRoutes);

  

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/songs", songsRoutes);
app.use("/api/album", albumRoutes);
app.use("/api/stat", statRoutes);


  

// Check registered routes
app._router.stack.forEach((r) => {
  if (r.route && r.route.path) {
    console.log("Registered route:", r.route.path);
  }
});


// Error handler
app.use((err, req, res, next) => {
  res.status(500).json({
    message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
  });
});

// Start server
httpServer.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  connectDB();
});

app.get('/', (req, res) => {
  res.send('API is running...');
});
