// models/Video.js
const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    category: { type: String, required: true }, // Red Mic / Qalander / Naama
    thumbnailUrl: String,
    videoUrl: { type: String, required: true },
    duration: String,
    date: { type: Date, default: Date.now },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
});

module.exports = mongoose.model("Video", videoSchema);