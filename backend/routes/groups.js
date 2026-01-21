const express = require("express");
const router = express.Router();
const Group = require("../models/Group");
const User = require("../models/User");
const auth = require("../middleware/auth");

// GET all groups
router.get("/", auth, async (req, res) => {
  const groups = await Group.find().populate("students", "name surname");
  res.json(groups);
});

// POST create group (admin only)
router.post("/", auth, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).send("Forbidden");

  const { name, studentIds } = req.body;

  const students = await User.find({
    _id: { $in: studentIds },
    role: "student",
  });

  const group = await Group.create({
    name,
    students: students.map(s => s._id),
  });

  res.json(group);
});

module.exports = router;
