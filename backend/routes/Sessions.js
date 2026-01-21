// backend/routes/Sessions.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth"); // make sure you have this
const Session = require("../models/Session");
const User = require("../models/User");
const Group = require("../models/Group");

// routes/sessions.js

// ---------------- Create session (Admin/Teacher) ----------------
router.post("/", auth, async (req, res) => {
  try {
    const { title, date, subject, teacherId, groupId } = req.body;

    const group = await Group.findById(groupId).populate("students");
    if (!group) return res.status(404).json({ message: "Group not found" });

    const students = group.students.map(s => ({ student: s._id, attendance: "absent" }));

    const session = await Session.create({
      title,
      date,
      subject,
      teacher: teacherId,
      group: groupId,
      students,
    });

    await session
      .populate("teacher", "name surname")
      .populate("group", "name")
      .populate("students.student", "name surname");

    res.status(201).json(session);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------------- Get sessions (Admin) ----------------
router.get("/admin", auth, async (req, res) => {
  try {
    const sessions = await Session.find()
      .populate("teacher", "name surname")
      .populate("group", "name")
      .populate("students.student", "name surname");

    res.json(sessions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------------- Get sessions (Teacher) ----------------
router.get("/teacher", auth, async (req, res) => {
  try {
    const sessions = await Session.find({ teacher: req.user._id })
      .populate("teacher", "name surname")
      .populate("group", "name")
      .populate("students.student", "name surname");

    res.json(sessions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------------- Update attendance ----------------
router.put("/:sessionId/students/:studentId", auth, async (req, res) => {
  try {
    const { sessionId, studentId } = req.params;
    const { attendance } = req.body;

    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ message: "Session not found" });

    const studentEntry = session.students.find(s => s.student.toString() === studentId);
    if (!studentEntry) return res.status(404).json({ message: "Student not found in this session" });

    studentEntry.attendance = attendance;
    await session.save();

    res.json(studentEntry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


/**
 * Delete a session (admin only)
 * DELETE /api/sessions/:id
 */
router.delete("/:id", auth, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).send("Forbidden");

  try {
    await Session.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
