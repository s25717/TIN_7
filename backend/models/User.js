const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  surname: String,
  email: { type: String, unique: true },
  passwordHash: String,
  role: { type: String, enum: ["student","teacher","admin"] },
  language: String
});

module.exports = mongoose.model("User", userSchema);
