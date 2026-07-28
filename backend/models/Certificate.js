const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  // For classroom-based certificates
  classroom: { type: mongoose.Schema.Types.ObjectId, ref: "Classroom", default: null },
  // For course-based certificates
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", default: null },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  // Distinguish between classroom vs course completion certificates
  type: { type: String, enum: ["classroom", "course"], default: "classroom" },
  certificateCode: { type: String, required: true, unique: true },
  issueDate: { type: Date, default: Date.now },
  certificateUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Certificate", certificateSchema);
