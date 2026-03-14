// routes/videoRoutes.js
const express = require("express");
const router = express.Router();
const videoController = require("../controllers/videoController");
const multer = require("multer");
const { protectAdmin } = require("../middleware/auth"); // Only protectAdmin is needed

// Multer config (store files in memory, you can later upload to Cloudinary/S3)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Admin upload route
router.post(
  "/upload",
  protectAdmin, // ensures only admin can upload
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  videoController.uploadVideo
);

// Public routes
router.get("/", videoController.getVideos); // optional ?category=Red Mic
router.get("/:id", videoController.getVideoById);

module.exports = router;