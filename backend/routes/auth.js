// backend/routes/auth.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    // JWT token
    const token = jwt.sign(
      { _id: user._id, role: user.role },
      "secret123", // move to .env for security later
      { expiresIn: "1h" }
    );

    res.json({ token, role: user.role, name: user.name, surname: user.surname });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
