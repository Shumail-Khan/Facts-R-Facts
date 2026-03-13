const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const categoryRoutes = require("./routes/categoryRoutes");
const videoRoutes = require("./routes/videoRoutes");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/categories", categoryRoutes);
app.use("/api/videos", videoRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});