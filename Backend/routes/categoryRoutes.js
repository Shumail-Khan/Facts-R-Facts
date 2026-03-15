const express = require("express");
const router = express.Router();
const multer = require("multer");

const categoryController = require("../controllers/categoryController");

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/", categoryController.getCategories);

router.get("/slug/:slug", categoryController.getCategoryBySlug);

router.post(
  "/",
  upload.single("image"),
  categoryController.createCategory
);

router.delete("/:id", categoryController.deleteCategory);

module.exports = router;