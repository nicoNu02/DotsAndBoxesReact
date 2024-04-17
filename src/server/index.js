import { createServer } from "http";
import { Server } from "socket.io";
import express from "express";
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

io.on("connection", (socket) => {
  console.log("connected");
  socket.on("disconnect", (socket) => {
    console.log("disconnect");
  });
  socket.on("board", (socket) => {
    console.log(socket);
  });
  socket.on("connect", (socket) => {
    console.log("connected");
  });
});

server.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});
