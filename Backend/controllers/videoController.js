// controllers/videoController.js
const Video = require("../models/Video");
const cloudinary = require("../utils/cloudinary"); // your Cloudinary upload utility
const streamifier = require("streamifier");

exports.uploadVideo = async (req, res) => {
  try {
    const videoFile = req.files.video[0];
    const thumbnailFile = req.files.thumbnail?.[0];

    // Upload video using stream
    const videoUpload = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: "video",
          folder: "podcasts",
          format: "mp4", // ensure it's treated as video
        },
        (error, result) => {
          if (result) resolve(result);
          else reject(error);
        }
      );

      streamifier.createReadStream(videoFile.buffer).pipe(stream);
    });

    let thumbnailUrl = "";

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

    const newVideo = await Video.create({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      videoUrl: videoUpload.secure_url,
      thumbnail: thumbnailUrl,
      duration: req.body.duration,
      tags: req.body.tags,
      language: req.body.language,
      featured: req.body.featured,
    });

    res.status(201).json({
      message: "Video uploaded successfully",
      video: newVideo,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Upload failed" });
  }
};

// Get all videos (optional filter by category)
exports.getVideos = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const videos = await Video.find(filter).sort({ date: -1 }); // latest first
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