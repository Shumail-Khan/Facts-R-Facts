// controllers/videoController.js
const Video = require("../models/Video");
const cloudinary = require("../utils/cloudinary"); // your Cloudinary upload utility
const streamifier = require("streamifier");

function extractYoutubeId(url) {
  const regex =
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^&?/]+)/;

  const match = url.match(regex);

  return match ? match[1] : null;
}

exports.uploadVideo = async (req, res) => {
  try {
    const videoFile = req.files?.video?.[0];
    const youtubeUrl = req.body.youtubeUrl?.trim();
    const thumbnailFile = req.files?.thumbnail?.[0];

    if (!videoFile && !youtubeUrl) {
      return res.status(400).json({
        message: "Upload a video OR provide a YouTube URL."
      });
    }

    let source = "cloudinary";
    let videoUrl = "";
    let youtubeId = "";
    let thumbnailUrl = req.body.thumbnailUrl || "";

    if (youtubeUrl) {
      source = "youtube";

      youtubeId = extractYoutubeId(youtubeUrl);

      if (!youtubeId) {
        return res.status(400).json({
          message: "Invalid YouTube URL"
        });
      }

      videoUrl = youtubeUrl;
      thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
    } else {
      // Upload video
      const videoUpload = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: "video",
            folder: "podcasts",
            eager: [{ format: "mp4" }],
            eager_async: true,
          },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );

        streamifier.createReadStream(videoFile.buffer).pipe(stream);
      });

      // ⭐ This was missing
      videoUrl = videoUpload.secure_url;

      // Upload thumbnail if provided
      if (thumbnailFile) {
        const thumbnailUpload = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "podcast-thumbnails",
            },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );

          streamifier.createReadStream(thumbnailFile.buffer).pipe(stream);
        });

        thumbnailUrl = thumbnailUpload.secure_url;
      }
    }

    const newVideo = await Video.create({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      source,
      videoUrl,
      youtubeId,
      thumbnailUrl,
      duration: req.body.duration,
    });

    res.status(201).json({
      message: "Video uploaded successfully",
      video: newVideo,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Upload failed"
    });
  }
};

// Get all videos (optional filter by category)
exports.getVideos = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const videos = await Video.find(filter).sort({ date: -1 }).populate("category"); // latest first
    res.status(200).json(videos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch videos" });
  }
};

// Get single video by ID
exports.getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: "Video not found" });
    res.status(200).json(video);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch video" });
  }
};


exports.incrementViews = async (req, res) => {
  try {

    const video = await Video.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },   // increase views by 1
      { new: true }
    );

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    res.status(200).json({
      message: "View updated",
      views: video.views
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update views" });
  }
};

exports.deleteVideo = async (req, res) => {
  try {

    const video = await Video.findByIdAndDelete(req.params.id);

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    res.json({
      message: "Video deleted successfully"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Delete failed" });
  }
};

exports.updateVideo = async (req, res) => {
  try {
    const updateData = {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      source: req.body.source,
    };

    if (req.body.source === "youtube") {
      const youtubeId = extractYoutubeId(req.body.youtubeUrl);

      if (!youtubeId) {
        return res.status(400).json({
          message: "Invalid YouTube URL",
        });
      }

      updateData.youtubeId = youtubeId;
      updateData.videoUrl = req.body.youtubeUrl;
      updateData.thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
    } else {
      updateData.youtubeId = "";
      updateData.videoUrl = req.body.videoUrl;
      updateData.thumbnailUrl = req.body.thumbnail;
    }

    const updatedVideo = await Video.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedVideo) {
      return res.status(404).json({
        message: "Video not found",
      });
    }

    res.json(updatedVideo);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Update failed",
    });
  }
};