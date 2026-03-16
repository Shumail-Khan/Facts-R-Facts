const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Video",
    required: true
  },

  user: {
    type: String,
    default: "Anonymous"
  },

  text: {
    type: String,
    required: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Comment", commentSchema);