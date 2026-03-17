require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db"); // Use the DB connection file
const adminRoutes = require("./routes/adminRoutes");
const videoRoutes = require("./routes/videoRoutes");
const categoryRoutes = require("./routes/categoryRoutes");

const app = express();

// Connect to MongoDB
connectDB(); // centralized DB connection

// Middleware
app.use(cors({
  origin: process.env.Frontend_URL, // Your React app URL
  credentials: true, // Allow cookies/authentication headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to the Facts-R-Facts Backend API!");
});

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/categories", categoryRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));