const bcrypt = require("bcryptjs");
const User = require("../models/User");

const seedAdmin = async () => {
  try {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const name = process.env.ADMIN_NAME || "Admin";

    if (!email || !password) {
      console.log("❌ Admin env variables missing");
      return;
    }

    const adminExists = await User.findOne({ email });

    if (adminExists) {
      console.log("⚠️ Admin already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
    });

    console.log("✅ Admin created");
  } catch (err) {
    console.error("❌ Error creating admin:", err.message);
  }
};

module.exports = seedAdmin;