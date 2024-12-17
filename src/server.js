const express = require("express");
const cors = require("cors");
const http = require("http");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Socket.IO setup
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

app.set("io", io);

// Routes
app.get("/", (req, res) => {
  res.send(
    "Welcome to the Contract Management Backend API! Use /api for available endpoints."
  );
});

// Example: Register API routes
const contractRoutes = require("./routes/contracts");
app.use("/api", contractRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
