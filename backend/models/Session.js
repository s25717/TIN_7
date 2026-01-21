// models/Session.js
const mongoose = require("mongoose");

const SessionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  subject: { type: String, required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
  students: [
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      attendance: { type: String, enum: ["present", "absent"], default: "absent" },
    },
  ],
});

module.exports = mongoose.model("Session", SessionSchema);
