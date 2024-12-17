const app = require("./app");
const http = require("http");
const { Server } = require("socket.io");

// Create HTTP and Socket.IO servers
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Disconnect event
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

app.set("io", io);

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
