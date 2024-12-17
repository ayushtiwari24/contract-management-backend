const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const contractRoutes = require("./routes/contractRoutes");

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Route registration
console.log("Routes registered on /api");
app.use("/api", contractRoutes);

module.exports = app;
