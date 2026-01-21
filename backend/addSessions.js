const mongoose = require("mongoose");
const User = require("./models/User");
const Session = require("./models/Session");

mongoose.connect("mongodb://127.0.0.1:27017/school")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

async function addSessions() {
  try {
    // Find the student
    const student = await User.findOne({ email: "student@test.com" });
    if (!student) throw new Error("Student not found");

    // Find a teacher (any teacher)
    const teacher = await User.findOne({ role: "teacher" });
    if (!teacher) throw new Error("Teacher not found");

    // Create 2 sessions for the student
    const session1 = await Session.create({
      title: "Math Lesson 2",
      date: new Date("2026-01-23T09:00:00Z"),
      subject: "Math",
      teacher: teacher._id,
      students: [
        { student: student._id, attendance: "present" }
      ]
    });

    const session2 = await Session.create({
      title: "Physics Lesson 2",
      date: new Date("2026-01-24T10:00:00Z"),
      subject: "Physics",
      teacher: teacher._id,
      students: [
        { student: student._id, attendance: "absent" }
      ]
    });

    console.log("Sessions added!");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

addSessions();
