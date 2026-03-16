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