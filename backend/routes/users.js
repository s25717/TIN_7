const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");

// GET all teachers (admin only)
router.get("/teachers", auth, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).send("Forbidden");

  const teachers = await User.find({ role: "teacher" }).select("_id name surname");
  res.json(teachers);
});

// GET all students (teacher/admin)
router.get("/students", auth, async (req, res) => {
  if (!["teacher", "admin"].includes(req.user.role)) return res.status(403).send("Forbidden");

  const students = await User.find({ role: "student" }).select("_id name surname");
  res.json(students);
});

module.exports = router;
