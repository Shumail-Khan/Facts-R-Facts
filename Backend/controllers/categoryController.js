const Category = require("../models/categoryModel");
const Video = require("../models/Video");


// Create category
exports.createCategory = async (req, res) => {
  try {

    const { name, description, icon } = req.body;

    const category = await Category.create({
      name,
      description,
      icon
    });

    res.status(201).json(category);

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


// Get categories with episode count
exports.getCategories = async (req, res) => {
  try {

    const categories = await Category.find().sort({ createdAt: -1 });

    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {

        const episodeCount = await Video.countDocuments({
          category: cat._id
        });

        return {
          _id: cat._id,
          name: cat.name,
          description: cat.description,
          icon: cat.icon,
          episodeCount
        };

      })
    );

    res.json(categoriesWithCount);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Delete category
exports.deleteCategory = async (req, res) => {
  try {

    await Category.findByIdAndDelete(req.params.id);

    res.json({ message: "Category deleted" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};