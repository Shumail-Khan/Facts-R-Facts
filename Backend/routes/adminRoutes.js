const express = require("express");
const router = express.Router();
const { adminLogin, createAdmin } = require("../controllers/authController");
const { protectAdmin } = require("../middleware/auth");

// Login
router.post("/login", adminLogin);

// Optional: Create admin from API
router.post("/create", protectAdmin, createAdmin);

// Example protected dashboard route
router.get("/dashboard", protectAdmin, (req, res) => {
  res.json({ message: `Welcome ${req.user.name} to admin dashboard` });
});

module.exports = router;