// backend/seed.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Session = require("./models/Session");
const Group = require("./models/Group");

async function seed() {
  try {
    // Clean existing data
    await User.deleteMany();
    await Group.deleteMany();
    await Session.deleteMany();

    // ---- Create Users ----
    const passwordHash = await bcrypt.hash("123456", 10);

    // Students
    const students = await User.insertMany([
      { name: "John", surname: "Doe", email: "student@test.com", passwordHash, role: "student", language: "en" },
      { name: "Alice", surname: "Smith", email: "alice@test.com", passwordHash, role: "student", language: "en" },
      { name: "Bob", surname: "Johnson", email: "bob@test.com", passwordHash, role: "student", language: "en" },
      { name: "Charlie", surname: "Lee", email: "charlie@test.com", passwordHash, role: "student", language: "en" },
    ]);

    // Teachers
    const teachers = await User.insertMany([
      { name: "Jane", surname: "Smith", email: "teacher@test.com", passwordHash, role: "teacher", language: "en" },
      { name: "Mr.", surname: "Anderson", email: "anderson@test.com", passwordHash, role: "teacher", language: "en" },
      { name: "Ms.", surname: "Brown", email: "brown@test.com", passwordHash, role: "teacher", language: "en" },
    ]);

    // Admin
    const admin = await User.create({
      name: "Admin",
      surname: "User",
      email: "admin@test.com",
      passwordHash,
      role: "admin",
      language: "en",
    });

    // ---- Create Groups ----
    const groups = await Group.insertMany([
      { name: "Group A", students: [students[1]._id, students[2]._id] }, // Alice & Bob
      { name: "Group B", students: [students[3]._id] }, // Charlie
    ]);

    // ---- Create Sessions ----
    await Session.insertMany([
      {
        title: "Math Lesson 1",
        date: new Date("2026-01-21T09:00:00Z"),
        subject: "Math",
        teacher: teachers[0]._id, // Jane Smith
        group: groups[0]._id, // Group A
        students: [
          { student: students[1]._id, attendance: "present" }, // Alice
          { student: students[2]._id, attendance: "absent" }, // Bob
        ],
      },
      {
        title: "Physics Lesson 1",
        date: new Date("2026-01-22T10:00:00Z"),
        subject: "Physics",
        teacher: teachers[0]._id,
        group: groups[1]._id, // Group B
        students: [{ student: students[3]._id, attendance: "present" }], // Charlie
      },
    ]);

    console.log("✅ Seeding complete!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

mongoose
  .connect("mongodb://127.0.0.1:27017/school")
  .then(() => {
    console.log("MongoDB connected for seeding");
    seed();
  })
  .catch((err) => console.error("MongoDB connection error:", err));
