import { Server } from "socket.io";
import { Message } from "../models/message.model.js";

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      credentials: true,
    },
  });

  const userSockets = new Map();     // { userId: socketId }
  const userActivities = new Map();  // { userId: activity }

  io.on("connection", (socket) => {
    console.log(`✅ New connection: ${socket.id}`);

    // Handle user connection
    socket.on("user_connected", (userId) => {
      console.log(`🟢 User connected: ${userId} (Socket: ${socket.id})`);

      userSockets.set(userId, socket.id);
      userActivities.set(userId, "Idle");

      // Notify all clients
      io.emit("user_connected", userId);
      socket.emit("users_online", Array.from(userSockets.keys()));
      io.emit("activities", Array.from(userActivities.entries()));
    });

    // Handle activity update
    socket.on("activity_updated", ({ userId, activity }) => {
      if (!userId || !activity) return;

      userActivities.set(userId, activity);

      console.log("🚀 Emitting activity_updated event:", { userId, activity });
      io.emit("activity_updated", { userId, activity });
    });

    // Handle listen along feature
   socket.on("listen_along", ({ song }) => {
  const startAt = Date.now() + 500; // Allow clients 0.5 seconds to sync
  console.log("🔊 Listen along triggered:", { song, startAt });

  io.emit("listen_along", { song, startAt });
});


    // Handle message sending
    socket.on("send_message", async (data) => {
      try {
        const { senderId, receiverId, content } = data;

        console.log(`📩 New message from ${senderId} to ${receiverId}: ${content}`);

        const message = await Message.create({ senderId, receiverId, content });

        // Send message in real-time
        const receiverSocketId = userSockets.get(receiverId);
        if (receiverSocketId) {
          console.log(`📬 Delivering message to ${receiverId} (Socket: ${receiverSocketId})`);
          io.to(receiverSocketId).emit("receive_message", message);
        }

        socket.emit("message_sent", message);
      } catch (error) {
        console.error("❌ Message error:", error);
        socket.emit("message_error", error.message);
      }
    });



	// Handle listen along request
socket.on("listen_request", ({ fromUser, toUser, song }) => {
  const targetSocketId = userSockets.get(toUser);
  if (targetSocketId) {
    io.to(targetSocketId).emit("listen_request", { fromUser, song });
  }
});

// Handle approval
socket.on("listen_request_approved", ({ toUser, song, startAt }) => {
  const receiverSocketId = userSockets.get(toUser);
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("listen_along", { song, startAt });
  }
});


    // Handle disconnection
    socket.on("disconnect", () => {
      let disconnectedUserId;
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          disconnectedUserId = userId;
          userSockets.delete(userId);
          userActivities.delete(userId);
          break;
        }
      }

      if (disconnectedUserId) {
        console.log(`🔴 User disconnected: ${disconnectedUserId}`);
        io.emit("user_disconnected", disconnectedUserId);
      }
    });
  });
};
