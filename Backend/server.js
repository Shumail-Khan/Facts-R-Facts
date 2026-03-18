require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const adminRoutes = require("./routes/adminRoutes");
const videoRoutes = require("./routes/videoRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const seedAdmin = require("./seeds/adminSeed");

const app = express();

// Middleware
// app.use(cors({
//   origin: process.env.FRONTEND_URL,
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
// }));
app.use(cors({ origin: true, credentials: true }));
app.options("*", cors());

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to the Facts-R-Facts Backend API!");
});

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/categories", categoryRoutes);

// Start server AFTER DB + Seed
const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  console.log("MongoDB connected");

  // ✅ Seed admin here
  if (process.env.SEED_ADMIN === "true") {
    await seedAdmin();
  }

  app.listen(PORT, () =>
    console.log(`Server running on port ${PORT}`)
  );
});