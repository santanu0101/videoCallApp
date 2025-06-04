import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import { connectDb } from "./lib/db.js";
import authRoute from "./routes/auth.route.js"
import userRoute from "./routes/user.route.js"

import {createServer} from 'http'
import {Server} from 'socket.io'
// import { Socket } from "dgram";


dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const server = createServer(app);

// 📌 middleware to handle cors ⚒️💻🪪📷🎥💡⌛🌐💀
const allowedOrigins = [process.env.FRONTEND_URL];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`💀 Not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// 📌 middleware to handle json and cookies
app.use(express.json());
app.use(cookieParser());

// 📌 routes
app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);




// 📌server and db start
;(async () => {
  try {
    await connectDb();
    app.listen(port, () => {
      console.log(`🌐 http://localhost:${port}`);
    });
  } catch (error) {
    console.log("💀 Server Error: ",error);
    process.exit(1);
  }
})();
