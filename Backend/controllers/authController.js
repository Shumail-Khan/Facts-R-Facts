const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// Admin login
exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await User.findOne({ email });
    if(!admin) return res.status(400).json({ message: "Admin not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if(!isMatch) return res.status(400).json({ message: "Invalid password" });

    if(admin.role !== "admin") return res.status(403).json({ message: "Not authorized" });

    const token = generateToken(admin);
    res.json({ token });
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
};

// Optional: Create admin from controller (instead of seed)
exports.createAdmin = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if(existing) return res.status(400).json({ message: "Admin already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await User.create({ name, email, password: hashedPassword, role: "admin" });
    res.status(201).json({ message: "Admin created", admin });
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
};