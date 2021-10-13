const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const path = require("path");
const app = express();
const dateFormat = require("date-format");
const Filter = require("bad-words");
const { addUser, getListUserByRoom, removeUser } = require("../public/users");

// static file
const publicPathDirectory = path.join(__dirname, "../public");
app.use(express.static(publicPathDirectory));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  /* options */
});

// nhận sự kiện kết nối từ client
io.on("connection", (socket) => {
  //Xu ly room
  socket.on("join-room", function ({ username, room }) {
    socket.join(room);

    const newUser = {
      room,
      username,
      id: socket.id,
    };
    addUser(newUser);
    io.emit("send-user-list", getListUserByRoom(room));
    socket.emit("send-message-server-to-client", {
      username: "ADMIN",
      time: dateFormat("dd/mm/yyyy hh:MM", new Date()),
      content: `Chao mung ${username} da vao ${room}`,
    });

    socket.broadcast.to(room).emit("send-message-server-to-client", {
      username: "ADMIN",
      time: dateFormat("dd/mm/yyyy hh:MM", new Date()),
      content: `${username} vua tham gia vao ${room}`,
    });

    // xử lý chat
    // nhận message từ client
    socket.on("send-messages-client-to-server", function (message, cb) {
      console.log("message : ", message);
      const filter = new Filter();

      if (filter.isProfane(message)) {
        return cb("Nội dung không hợp lệ");
      }
      const newMessage = {
        username,
        time: dateFormat("dd/mm/yyyy hh:MM", new Date()),
        content: message,
      };

      //gửi message về client
      io.to(room).emit("send-message-server-to-client", newMessage);

      cb();
    });

    socket.on("send-loaction-client-to-server", ({ latitude, longitude }) => {
      const urlLocation = `https://www.google.com/maps?q=${latitude},${longitude}`;

      const newLocation = {
        username,
        time: dateFormat("dd/mm/yyyy hh:MM", new Date()),
        content: urlLocation,
      };

      //gửi message về client
      io.to(room).emit("send-loaction-server-to-client", newLocation);
    });
  });

  // ngắt kết nối
  socket.on("disconnect", () => {
    removeUser(socket.id);
    console.log(`client ${socket.id} disconnect `);
  });
});

const port = process.env.PORT || 3333;
httpServer.listen(port, () => {
  console.log("app run on port " + port);
});
