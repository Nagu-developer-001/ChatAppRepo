import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import Message from "./models/messages.js";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";

const app = express();
const port = 3000;

const server = createServer(app);
const io = new Server(server, {
  connectionStateRecovery: {}
});


const pubClient = createClient({ url: "redis://localhost:6379" });
const subClient = pubClient.duplicate();

await pubClient.connect();
await subClient.connect();

io.adapter(createAdapter(pubClient, subClient));

const __dirname = dirname(fileURLToPath(import.meta.url));

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "index.html"));
});

// ✅ MAIN SOCKET LOGIC
io.on("connection", async (socket) => {
  console.log("Client connected:", socket.id);

  // ✅ Handle incoming messages with ack + dedup
  socket.on("chat message", async (msg, clientOffset, callback) => {
    let saved;

    try {
      saved = await Message.create({
        content: msg,
        clientOffset: clientOffset
      });
    } catch (err) {
      if (err.code === 11000) {
        // ✅ Duplicate message → already stored
        callback(); // ACK anyway
      }
      return;
    }

    // ✅ Broadcast to all clients
    io.emit("chat message", msg, saved._id.toString(),socket.id);

    // ✅ ACK to sender
    callback();
  });

  // ✅ Recovery logic
  if (!socket.recovered) {
    const lastSeen = socket.handshake.auth.serverOffset || null;

    let missedMessages = [];

    try {
      if (lastSeen) {
        missedMessages = await Message.find({
          _id: { $gt: new mongoose.Types.ObjectId(lastSeen) }
        });
      } else {
        missedMessages = await Message.find();
      }
    } catch (err) {
      console.log("Recovery error:", err);
      return;
    }

    //  Send missed messages
    for (let m of missedMessages) {
      socket.emit("chat message", m.content, m._id.toString());
    }
  }
});
const PORT = process.env.PORT || process.argv[2] || 3000;
//  START SERVER + CONNECT DB
server.listen(PORT, async () => {
  const connectDB = await mongoose.connect(
    "mongodb+srv://tvmgroupofltd_db_user:Dv9M7j3GovJOC4fT@appvideocall.9wy5mn8.mongodb.net/?appName=AppVideoCall"
  );

  console.log("Connected to MongoDB");
  console.log(`Connected to MongoDB : HOST = ${connectDB.connection.host} AT ${PORT}`);
});



// server.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });