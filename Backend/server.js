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
const allowedOrigins = [
  process.env.Frontend_URL
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

// ✅ IMPORTANT: manually handle OPTIONS without route pattern
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Credentials", "true");
    return res.sendStatus(204);
  }
  next();
});

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