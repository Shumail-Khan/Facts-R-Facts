// routes/videoRoutes.js
const express = require("express");
const router = express.Router();
const videoController = require("../controllers/videoController");
const multer = require("multer");
const likeController = require("../controllers/likeController");
const commentController = require("../controllers/commentController");
const { protectAdmin } = require("../middleware/auth"); // Only protectAdmin is needed

// Multer config (store files in memory, you can later upload to Cloudinary/S3)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Admin upload route
router.post(
  "/upload",
  // protectAdmin, // ensures only admin can upload
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  videoController.uploadVideo
);

// Public routes
router.get("/", videoController.getVideos); // optional ?category=Red Mic
router.get("/:id", videoController.getVideoById);
router.post("/:id/like", likeController.likeVideo);
router.post("/:id/comments", commentController.addComment);
router.get("/:id/comments", commentController.getComments);
router.post("/:id/view", videoController.incrementViews);
router.delete("/:id",  videoController.deleteVideo);
router.put("/:id",  videoController.updateVideo);

router.get("/comments/all", commentController.getAllComments);
router.delete("/comments/:id", commentController.deleteComment);

module.exports = router;