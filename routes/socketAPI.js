const socket_io = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Message = require("../models/Message");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const io = socket_io();
const socketApi = {};
let onlineUsers = {};
const socketTypes = {
  NOTIFICATION: "SOCKET.NOTIFICATION",
  CLIENT_SEND: "SOCKET.CLIENT_SEND",
  CLIENT_RECEIVE: "SOCKET.CLIENT_RECEIVE",
  ERROR: "SOCKET.ERROR",
};

socketApi.io = io;

io.use((socket, next) => {
  try {
    const accessToken = socket.handshake.query.accessToken;
    const roomId = socket.handshake.query.roomId;
    jwt.verify(accessToken, JWT_SECRET_KEY, (err, payload) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return next(new Error("Token expired"));
        } else {
          return next(new Error("Token is invalid"));
        }
      }
      socket.userId = payload._id;
      socket.roomId = roomId;
    });
    next();
  } catch (error) {
    next(error);
  }
});

io.on("connection", async function (socket) {
  if (!onlineUsers[socket.roomId]) {
    onlineUsers[socket.roomId] = new Set([socket.userId]);
    console.log("43", onlineUsers);
  } else {
    onlineUsers[socket.roomId] = new Set([socket.userId]);

    console.log("Online USers 45", onlineUsers, socket.roomId);
    onlineUsers[socket.roomId].add(socket.userId);
  }
  socket.join(socket.roomId);
  console.log("Connected", socket.userId, "Room", socket.roomId);

  try {
    let oldMessages = await (
      await Message.find({ roomId: socket.roomId }, "-updatedAt")
        .sort({ _id: -1 })
        .limit(100)
        .populate("user", "name avatarUrl")
    ).reverse();
    io.to(socket.roomId).emit(socketTypes.NOTIFICATION, {
      onlineUsers: [...onlineUsers[socket.roomId]],
      oldMessages,
    });
  } catch (error) {
    console.log(error);
  }

  socket.on(socketTypes.CLIENT_SEND, async (msg) => {
    try {
      console.log(msg);
      if (msg.body) {
        const user = await User.findById(msg.from, "name avatarUrl");
        if (user && user._id.equals(socket.userId)) {
          const newMessage = await Message.create({
            roomId: socket.roomId,
            user,
            body: msg.body,
          });
          io.to(socket.roomId).emit(socketTypes.CLIENT_RECEIVE, newMessage);
        }
      }
    } catch (error) {
      console.log(error);
    }
  });

  socket.on("error", (error) => {
    console.log(error);
  });

  socket.on("shareLocation", async ({ lat, lng, room }) => {
    console.log(lat, lng, room);
    io.to(room).emit("sharingLocation", { lat, lng, room });
  });

  socket.on("disconnect", () => {
    console.log("Disconnected", socket.userId);
    onlineUsers[socket.roomId].delete(socket.userId);
    io.to(socket.roomId).emit(socketTypes.NOTIFICATION, {
      onlineUsers: [...onlineUsers[socket.roomId]],
    });
  });
});

module.exports = socketApi;
