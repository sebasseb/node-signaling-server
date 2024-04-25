const { Server } = require("socket.io");

const io = new Server(8000, {
  cors: true,
});

const emailToSocketIdMap = new Map();
const socketidToEmailMap = new Map();

io.on("connection", (socket) => {
  console.log(`Socket Connected`, socket.id);
  socket.on("room:join", (data) => {
    const { email, room } = data;
    emailToSocketIdMap.set(email, socket.id);
    socketidToEmailMap.set(socket.id, email);
    io.to(room).emit("user:joined", { email, id: socket.id });
    socket.join(room);
    io.to(socket.id).emit("room:join", data);
    socket.emit("turnServer", {
      url: "turn:179.60.67.81:3478",
      username: "seba",
      credential: "12345",
    });
    socket.on("data", (data) => {
      const fs = require("fs");
      const path = require("path");


      // const { v4: uuidv4 } = require('uuid');
      // const filename = `output-${uuidv4()}.wav`;


      const filename = `output-${socket.id}.wav`;


      // Asumiendo que 'data' es un Buffer de datos binarios de audio
      const filePath = path.join(__dirname, filename);
      fs.writeFile(filePath, data, { encoding: "binary" }, (err) => {
        if (err) {
          console.error("Error al guardar el archivo:", err);
        } else {
          console.log("Archivo guardado correctamente:", filePath);
        }
      });
    });
  });

  // socket.emit('iceConfiguration', iceServers);

  socket.on("user:call", ({ to, offer }) => {
    io.to(to).emit("incomming:call", { from: socket.id, offer });
  });

  socket.on("call:accepted", ({ to, ans }) => {
    io.to(to).emit("call:accepted", { from: socket.id, ans });
  });

  socket.on("peer:nego:needed", ({ to, offer }) => {
    // console.log("peer:nego:needed", offer);
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    // console.log("peer:nego:done", ans);
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });
});
