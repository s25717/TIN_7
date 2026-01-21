const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Session = require("./models/Session");

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = "secret123"; // same as login hashing secret

// ---------- AUTH MIDDLEWARE ----------
const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).send("No token provided");

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    return res.status(401).send("Unauthorized");
  }
};
// ---------- USER ROUTES ----------
const userRoutes = require("./routes/users");
app.use("/api/users", userRoutes);

const groupRoutes = require("./routes/groups");
app.use("/api/groups", groupRoutes);


// ---------- LOGIN ----------
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });
    res.json({ token, role: user.role, name: user.name, surname: user.surname });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).send("Server error");
  }
});

const sessionRoutes = require("./routes/Sessions");
app.use("/api/sessions", sessionRoutes);

// ---------- STUDENT SESSIONS ----------
app.get("/api/sessions/student", auth, async (req, res) => {
  if (req.user.role !== "student") return res.status(403).send("Forbidden");

  const sessions = await Session.find({ "students.student": req.user.id })
    .populate("teacher", "name surname")
    .populate("students.student", "name surname");

  res.json(sessions);
});

// ---------- TEACHER SESSIONS ----------
app.get("/api/sessions/teacher", auth, async (req, res) => {
  if (req.user.role !== "teacher") return res.status(403).send("Forbidden");

  const sessions = await Session.find({ teacher: req.user.id })
    .populate("teacher", "name surname")
    .populate("students.student", "name surname");

  res.json(sessions);
});

// ---------- UPDATE ATTENDANCE (TEACHER) ----------
app.put("/api/sessions/:sessionId/students/:studentId", auth, async (req, res) => {
  if (req.user.role !== "teacher") return res.status(403).send("Forbidden");

  const { sessionId, studentId } = req.params;
  const { attendance } = req.body;

  const session = await Session.findById(sessionId);
  if (!session) return res.status(404).send("Session not found");
  if (session.teacher.toString() !== req.user.id.toString()) return res.status(403).send("Cannot modify other teacher's session");

  const studentEntry = session.students.find(st => st.student.toString() === studentId);
  if (!studentEntry) return res.status(404).send("Student not found in this session");

  studentEntry.attendance = attendance;
  await session.save();

  res.json({ success: true });
});

// ---------- ADMIN SESSIONS ----------
app.get("/api/sessions/admin", auth, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).send("Forbidden");

  const sessions = await Session.find()
    .populate("teacher", "name surname")
    .populate("students.student", "name surname");

  res.json(sessions);
});

// ---------- DELETE SESSION (ADMIN) ----------
app.delete("/api/sessions/:id", auth, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).send("Forbidden");

  await Session.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// ---------- CONNECT TO MONGO & START SERVER ----------
mongoose
  .connect("mongodb://127.0.0.1:27017/school")
  .then(() => {
    console.log("MongoDB connected");
    app.listen(5000, () => {
      console.log("Server running on http://localhost:5000");
    });
  })
  .catch(err => console.error(err));
