import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import { connectDb } from "./lib/db.js";
import authRoute from "./routes/auth.route.js";
import userRoute from "./routes/user.route.js";

import { createServer } from "http";
import { Server } from "socket.io";
import { format } from "path";
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

const io = new Server(server, {
  pingTimeOut: 60000,
  cors: {
    origin: allowedOrigins[0],
    methods: ["GET", "POST"],
  },
});

let onlineUser = []

io.on("connection", (socket) => {
  console.log(`Info - new Connection ${socket.id}`);
  // socket id send to the connected user
  socket.emit("me", socket.id);

  socket.on("join", (user) => {
    if (!user || !user.id) {
      console.log("warring- Invalid User data on Joun");
      return;
    }
    socket.join(user.id);
    const existingUser = onlineUser.find((u) => u.userId === user.id);
    if (existingUser) {
      existingUser.socketId = socket.id;
    } else {
      onlineUser.push({
        userId: user.id,
        name: user.name,
        socketId: socket.id,
      });
    }

    io.emit("online-users", onlineUser);
  });

  socket.on("callToUser",(data)=>{
    // console.log("Incomming call from ",data);
    
    const call = onlineUser.find((user)=>user.userId === data.callToUserId)
    if(!call){
      // console.log("call to user id", call)
      socket.emit("userUnavailable", {message: `User is offline`})
      return;
    }

    //emit an event to the reciver socket(caller)
    io.to(call.socketId).emit("callToUser", {
      signal: data.signalData,
      form: data.from,
      name: data.name,
      email: data.email,
      profilePic: data.profilePic,

    })
  })

  socket.on("answeredCall",(data)=>{
    // console.log(data)
    io.to(data.to).emit("callAccepted",{
      signal:data.signal,
      from:data.from
    })
  })


  socket.on("reject-call",(data)=>{
    // console.log(data)
    io.to(data.to).emit("callRejected",{
      name:data.name,
      profilePic: data.profilePic
    })
  })


  socket.on("disconnect", () => {
    const user = onlineUser.find((u) => u.socketId === socket.id);
    onlineUser = onlineUser.filter((u) => u.socketId !== socket.id);

    io.emit("online-users", onlineUser);

    socket.broadcast.emit("discounnectUser", { disUser: socket.id });

    console.log(`[INFO] Disconnected: ${socket.id}`);
  });
});

// 📌server and db start
(async () => {
  try {
    await connectDb();
    server.listen(port, () => {
      console.log(`🌐 http://localhost:${port}`);
    });
  } catch (error) {
    console.log("💀 Server Error: ", error);
    process.exit(1);
  }
})();
