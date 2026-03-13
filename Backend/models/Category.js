const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: String,
  slug: String,
  description: String
});

module.exports = mongoose.model("Category", categorySchema);