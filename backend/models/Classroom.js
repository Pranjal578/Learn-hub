const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: ["text", "pdf", "image", "link"], required: true },
    contentUrl: { type: String, default: null }, // Cloudinary URL or external link
    textBody: { type: String, default: null },   // For inline text materials
    createdAt: { type: Date, default: Date.now },
});

const submissionSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    submissionUrl: { type: String, required: true },
    submittedAt: { type: Date, default: Date.now },
});

const assignmentSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    fileUrl: { type: String, default: null }, // optional reference file
    dueDate: { type: Date, required: true },
    submissions: [submissionSchema],
    createdAt: { type: Date, default: Date.now },
});

const noticeSchema = new mongoose.Schema({
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const classroomSchema = new mongoose.Schema(
    {
        className: { type: String, required: true, trim: true },
        description: { type: String, required: true },
        duration: {
            type: String,
            required: true,
            enum: ["6 months", "1 year", "Custom"],
        },
        instructor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        uniqueCode: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },
        shareableUrl: { type: String, required: true, unique: true },
        studentsEnrolled: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        materials: [materialSchema],
        assignments: [assignmentSchema],
        notices: [noticeSchema],
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Classroom", classroomSchema);
