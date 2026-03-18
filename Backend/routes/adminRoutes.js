const express = require("express");
const router = express.Router();
const { adminLogin, createAdmin } = require("../controllers/authController");
const { changePassword } = require("../controllers/authController");
const { protectAdmin } = require("../middleware/auth");
const multer = require("multer");
const upload = multer();

// Login
router.post("/login", upload.none(), adminLogin);

// Optional: Create admin from API
router.post("/create", protectAdmin, createAdmin);

router.post("/change-password", protectAdmin, changePassword);

module.exports = router;