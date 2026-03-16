const Video = require("../models/Video");

exports.likeVideo = async (req, res) => {
  try {

    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    video.likes += 1;

    await video.save();

    res.json({
      message: "Video liked",
      likes: video.likes
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};