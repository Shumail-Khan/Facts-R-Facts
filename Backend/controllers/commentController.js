const Comment = require("../models/Comment");
const Video = require("../models/Video");

exports.addComment = async (req, res) => {
  try {

    const { text, user } = req.body;

    const comment = await Comment.create({
      videoId: req.params.id,
      text,
      user
    });

    // increase comment count
    await Video.findByIdAndUpdate(req.params.id, {
      $inc: { comments: 1 }
    });

    res.status(201).json(comment);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getComments = async (req, res) => {
  try {

    const comments = await Comment.find({
      videoId: req.params.id
    }).sort({ createdAt: -1 });

    res.json(comments);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllComments = async (req, res) => {
  try {
    const comments = await Comment.find()
      .populate("videoId", "title thumbnailUrl") // useful for admin UI
      .sort({ createdAt: -1 })
      .limit(50); // prevent overload

    res.json(comments);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // decrement comment count
    await Video.findByIdAndUpdate(comment.videoId, {
      $inc: { comments: -1 }
    });

    await comment.deleteOne();

    res.json({ message: "Comment deleted successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};