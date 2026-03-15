const Category = require("../models/categoryModel");
const Video = require("../models/Video");
const cloudinary = require("../utils/cloudinary");
const slugify = require("slugify");


// Create category
exports.createCategory = async (req, res) => {
  try {

    const { name, description, icon } = req.body;

    const slug = slugify(name, { lower: true, strict: true });

    let imageUrl = "";

    if (req.file) {

      const result = await new Promise((resolve, reject) => {

        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "categories"
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        stream.end(req.file.buffer);
      });

      imageUrl = result.secure_url;
    }

    const category = await Category.create({
      name,
      slug,
      description,
      icon,
      image: imageUrl
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
          slug: cat.slug,
          description: cat.description,
          icon: cat.icon,
          image: cat.image,
          episodeCount
        };

      })
    );

    res.json(categoriesWithCount);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// Get category by slug
exports.getCategoryBySlug = async (req, res) => {
  try {

    const category = await Category.findOne({
      slug: req.params.slug
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const videos = await Video.find({
      category: category._id
    }).populate("category", "name slug");

    res.json({
      category,
      videos
    });

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