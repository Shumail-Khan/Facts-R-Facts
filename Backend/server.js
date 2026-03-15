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
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/categories", categoryRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));