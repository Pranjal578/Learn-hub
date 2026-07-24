const Classroom = require("../models/Classroom");
const User = require("../models/user");
const crypto = require("crypto");
require("dotenv").config();

// ================ CREATE CLASSROOM (Instructor only) ================
exports.createClassroom = async (req, res) => {
    try {
        const { className, description, duration } = req.body;
        const instructorId = req.user.id;

        if (!className || !description || !duration) {
            return res.status(400).json({
                success: false,
                message: "All fields (className, description, duration) are required",
            });
        }

        // Generate unique 8-char uppercase code, retry on collision
        let uniqueCode;
        let exists = true;
        while (exists) {
            uniqueCode = crypto.randomBytes(4).toString("hex").toUpperCase();
            exists = await Classroom.findOne({ uniqueCode });
        }

        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        const shareableUrl = `${frontendUrl}/join/${uniqueCode}`;

        const newClassroom = await Classroom.create({
            className,
            description,
            duration,
            instructor: instructorId,
            uniqueCode,
            shareableUrl,
        });

        // Link classroom to instructor's profile
        await User.findByIdAndUpdate(instructorId, {
            $push: { classrooms: newClassroom._id },
        });

        return res.status(201).json({
            success: true,
            message: "Classroom created successfully",
            data: newClassroom,
        });
    } catch (error) {
        console.error("Error creating classroom:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create classroom",
            error: error.message,
        });
    }
};


// ================ JOIN CLASSROOM (Student only) ================
exports.joinClassroom = async (req, res) => {
    try {
        const { uniqueCode } = req.body;
        const studentId = req.user.id;

        if (!uniqueCode) {
            return res.status(400).json({ success: false, message: "Unique code is required" });
        }

        const classroom = await Classroom.findOne({ uniqueCode: uniqueCode.toUpperCase() });
        if (!classroom) {
            return res.status(404).json({
                success: false,
                message: "Invalid class code. Please check and try again.",
            });
        }

        if (!classroom.isActive) {
            return res.status(403).json({ success: false, message: "This classroom is no longer active" });
        }

        // Prevent duplicate enrollment
        if (classroom.studentsEnrolled.includes(studentId)) {
            return res.status(400).json({
                success: false,
                message: "You are already enrolled in this classroom",
            });
        }

        classroom.studentsEnrolled.push(studentId);
        await classroom.save();

        // Link classroom to student's profile
        await User.findByIdAndUpdate(studentId, {
            $push: { classrooms: classroom._id },
        });

        return res.status(200).json({
            success: true,
            message: "Successfully joined classroom",
            data: classroom,
        });
    } catch (error) {
        console.error("Error joining classroom:", error);
        return res.status(500).json({
            success: false,
            message: "Enrollment failed",
            error: error.message,
        });
    }
};


const fs = require("fs");

// Helper function to upload file with Cloudinary + Base64 Data URI fallback
async function processFileUpload(file) {
    try {
        const uploadResult = await uploadImageToCloudinary(file, process.env.FOLDER_NAME || "LearnHub");
        if (uploadResult && uploadResult.secure_url) {
            return uploadResult.secure_url;
        }
    } catch (err) {
        console.warn("Cloudinary upload error, using Data URI fallback:", err.message);
    }

    let fileBuffer = null;
    if (file.tempFilePath && fs.existsSync(file.tempFilePath)) {
        fileBuffer = fs.readFileSync(file.tempFilePath);
    } else if (file.data && file.data.length > 0) {
        fileBuffer = file.data;
    }

    if (!fileBuffer || fileBuffer.length === 0) {
        throw new Error("Unable to read uploaded file buffer");
    }

    const mime = file.mimetype || "application/pdf";
    return `data:${mime};base64,${fileBuffer.toString("base64")}`;
}

// ================ GET CLASSROOM DETAILS ================
exports.getClassroomDetails = async (req, res) => {
    try {
        const { classroomId } = req.body;

        const classroom = await Classroom.findById(classroomId)
            .populate("instructor", "firstName lastName email image")
            .populate("studentsEnrolled", "firstName lastName email image")
            .populate({
                path: "assignments.submissions.student",
                select: "firstName lastName email image",
            });

        if (!classroom) {
            return res.status(404).json({ success: false, message: "Classroom not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Classroom details fetched successfully",
            data: classroom,
        });
    } catch (error) {
        console.error("Error fetching classroom details:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch classroom details",
            error: error.message,
        });
    }
};


// ================ GET MY CLASSROOMS (Instructor: created | Student: enrolled) ================
exports.getMyClassrooms = async (req, res) => {
    try {
        const userId = req.user.id;
        const accountType = (req.user.accountType || "").toLowerCase();

        const userDoc = await User.findById(userId);
        const userClassroomIds = userDoc?.classrooms || [];

        let classrooms;
        if (accountType === "instructor") {
            classrooms = await Classroom.find({
                $or: [
                    { instructor: userId },
                    { _id: { $in: userClassroomIds } }
                ]
            })
                .populate("studentsEnrolled", "firstName lastName image")
                .sort({ createdAt: -1 });
        } else {
            classrooms = await Classroom.find({
                $or: [
                    { studentsEnrolled: userId },
                    { _id: { $in: userClassroomIds } }
                ]
            })
                .populate("instructor", "firstName lastName image")
                .sort({ createdAt: -1 });
        }

        return res.status(200).json({
            success: true,
            message: "Classrooms fetched successfully",
            data: classrooms,
        });
    } catch (error) {
        console.error("Error fetching classrooms:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch classrooms",
            error: error.message,
        });
    }
};


// ================ POST MATERIAL (Instructor only) ================
exports.postMaterial = async (req, res) => {
    try {
        let { classroomId, title, type, contentUrl, textBody } = req.body;
        const instructorId = req.user.id;

        const classroom = await Classroom.findOne({ _id: classroomId, instructor: instructorId });
        if (!classroom) {
            return res.status(404).json({ success: false, message: "Classroom not found or unauthorized" });
        }

        if (!title || !type) {
            return res.status(400).json({ success: false, message: "Title and type are required" });
        }

        // Handle file upload if present
        if (req.files && req.files.materialFile) {
            try {
                contentUrl = await processFileUpload(req.files.materialFile);
            } catch (uploadError) {
                console.error("Material upload error:", uploadError);
                return res.status(500).json({ success: false, message: "Failed to upload material file" });
            }
        }

        classroom.materials.push({ title, type, contentUrl, textBody });
        await classroom.save();

        return res.status(201).json({
            success: true,
            message: "Material posted successfully",
            data: classroom.materials[classroom.materials.length - 1],
        });
    } catch (error) {
        console.error("Error posting material:", error);
        return res.status(500).json({ success: false, message: "Failed to post material", error: error.message });
    }
};


// ================ POST NOTICE / ANNOUNCEMENT (Instructor only) ================
exports.postNotice = async (req, res) => {
    try {
        const { classroomId, message } = req.body;
        const instructorId = req.user.id;

        if (!message) {
            return res.status(400).json({ success: false, message: "Notice message is required" });
        }

        const classroom = await Classroom.findOne({ _id: classroomId, instructor: instructorId });
        if (!classroom) {
            return res.status(404).json({ success: false, message: "Classroom not found or unauthorized" });
        }

        classroom.notices.push({ message });
        await classroom.save();

        return res.status(201).json({
            success: true,
            message: "Notice posted successfully",
            data: classroom.notices[classroom.notices.length - 1],
        });
    } catch (error) {
        console.error("Error posting notice:", error);
        return res.status(500).json({ success: false, message: "Failed to post notice", error: error.message });
    }
};


// ================ CREATE ASSIGNMENT (Instructor only) ================
exports.createAssignment = async (req, res) => {
    try {
        let { classroomId, title, description, fileUrl, dueDate } = req.body;
        const instructorId = req.user.id;

        if (!title || !dueDate) {
            return res.status(400).json({ success: false, message: "Title and due date are required" });
        }

        // Handle assignment PDF upload if provided
        if (req.files && req.files.assignmentFile) {
            const assignFile = req.files.assignmentFile;
            if (assignFile.size > 10 * 1024 * 1024) {
                return res.status(400).json({ success: false, message: "Assignment file size must not exceed 10 MB" });
            }
            try {
                fileUrl = await processFileUpload(assignFile);
            } catch (uploadError) {
                console.error("Assignment upload error:", uploadError);
                return res.status(500).json({ success: false, message: "Failed to upload assignment file" });
            }
        }

        const classroom = await Classroom.findOne({ _id: classroomId, instructor: instructorId });
        if (!classroom) {
            return res.status(404).json({ success: false, message: "Classroom not found or unauthorized" });
        }

        classroom.assignments.push({ title, description, fileUrl, dueDate });
        await classroom.save();

        return res.status(201).json({
            success: true,
            message: "Assignment created successfully",
            data: classroom.assignments[classroom.assignments.length - 1],
        });
    } catch (error) {
        console.error("Error creating assignment:", error);
        return res.status(500).json({ success: false, message: "Failed to create assignment", error: error.message });
    }
};


// ================ EXTEND ASSIGNMENT DEADLINE (Instructor only) ================
exports.extendAssignmentDeadline = async (req, res) => {
    try {
        const { classroomId, assignmentId, newDueDate } = req.body;
        const instructorId = req.user.id;

        if (!newDueDate) {
            return res.status(400).json({ success: false, message: "New due date is required" });
        }

        const classroom = await Classroom.findOne({ _id: classroomId, instructor: instructorId });
        if (!classroom) {
            return res.status(404).json({ success: false, message: "Classroom not found or unauthorized" });
        }

        const assignment = classroom.assignments.id(assignmentId);
        if (!assignment) {
            return res.status(404).json({ success: false, message: "Assignment not found" });
        }

        assignment.dueDate = new Date(newDueDate);
        await classroom.save();

        return res.status(200).json({
            success: true,
            message: "Assignment deadline extended successfully",
            data: assignment,
        });
    } catch (error) {
        console.error("Error extending deadline:", error);
        return res.status(500).json({ success: false, message: "Failed to extend deadline", error: error.message });
    }
};


// ================ SUBMIT ASSIGNMENT (Student only) ================
exports.submitAssignment = async (req, res) => {
    try {
        let { classroomId, assignmentId, submissionUrl } = req.body;
        const studentId = req.user.id;

        // Handle file upload if present
        if (req.files && req.files.submissionFile) {
            const subFile = req.files.submissionFile;
            if (subFile.size > 10 * 1024 * 1024) {
                return res.status(400).json({ success: false, message: "File size exceeds 10 MB limit" });
            }
            try {
                submissionUrl = await processFileUpload(subFile);
            } catch (uploadError) {
                console.error("Assignment submission upload error:", uploadError);
                return res.status(500).json({ success: false, message: "Failed to upload submission file" });
            }
        }

        if (!submissionUrl) {
            return res.status(400).json({ success: false, message: "Submission URL or file is required" });
        }

        const classroom = await Classroom.findOne({
            _id: classroomId,
            studentsEnrolled: studentId,
        });
        if (!classroom) {
            return res.status(404).json({ success: false, message: "Classroom not found or not enrolled" });
        }

        const assignment = classroom.assignments.id(assignmentId);
        if (!assignment) {
            return res.status(404).json({ success: false, message: "Assignment not found" });
        }

        // Check deadline
        if (new Date() > assignment.dueDate) {
            return res.status(403).json({ success: false, message: "Submission deadline has passed" });
        }

        // Prevent duplicate submission
        const alreadySubmitted = assignment.submissions.find(
            (s) => s.student.toString() === studentId
        );
        if (alreadySubmitted) {
            return res.status(400).json({ success: false, message: "You have already submitted this assignment" });
        }

        assignment.submissions.push({ student: studentId, submissionUrl });
        await classroom.save();

        return res.status(201).json({
            success: true,
            message: "Assignment submitted successfully",
        });
    } catch (error) {
        console.error("Error submitting assignment:", error);
        return res.status(500).json({ success: false, message: "Failed to submit assignment", error: error.message });
    }
};


// ================ DELETE ASSIGNMENT SUBMISSION (Student only, before deadline) ================
exports.deleteAssignmentSubmission = async (req, res) => {
    try {
        const { classroomId, assignmentId } = req.body;
        const studentId = req.user.id;

        const classroom = await Classroom.findOne({
            _id: classroomId,
            studentsEnrolled: studentId,
        });
        if (!classroom) {
            return res.status(404).json({ success: false, message: "Classroom not found or not enrolled" });
        }

        const assignment = classroom.assignments.id(assignmentId);
        if (!assignment) {
            return res.status(404).json({ success: false, message: "Assignment not found" });
        }

        // Check deadline
        if (new Date() > assignment.dueDate) {
            return res.status(403).json({ success: false, message: "Cannot delete submission after deadline" });
        }

        assignment.submissions = assignment.submissions.filter(
            (s) => s.student.toString() !== studentId
        );
        await classroom.save();

        return res.status(200).json({
            success: true,
            message: "Submission deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting submission:", error);
        return res.status(500).json({ success: false, message: "Failed to delete submission", error: error.message });
    }
};


// ================ LEAVE CLASSROOM (Student only) ================
exports.leaveClassroom = async (req, res) => {
    try {
        const { classroomId } = req.body;
        const studentId = req.user.id;

        if (!classroomId) {
            return res.status(400).json({ success: false, message: "Classroom ID is required" });
        }

        const classroom = await Classroom.findById(classroomId);
        if (!classroom) {
            return res.status(404).json({ success: false, message: "Classroom not found" });
        }

        // Pull student from classroom enrolled array
        await Classroom.findByIdAndUpdate(classroomId, {
            $pull: { studentsEnrolled: studentId },
        });

        // Pull classroom from student's profile
        await User.findByIdAndUpdate(studentId, {
            $pull: { classrooms: classroomId },
        });

        return res.status(200).json({
            success: true,
            message: "Left classroom successfully",
        });
    } catch (error) {
        console.error("Error leaving classroom:", error);
        return res.status(500).json({ success: false, message: "Failed to leave classroom", error: error.message });
    }
};


// ================ DELETE CLASSROOM (Instructor or Admin) ================
exports.deleteClassroom = async (req, res) => {
    try {
        const { classroomId } = req.body;
        const userId = req.user.id;
        const accountType = (req.user.accountType || "").toLowerCase();

        const classroom = await Classroom.findById(classroomId);
        if (!classroom) {
            return res.status(404).json({ success: false, message: "Classroom not found" });
        }

        // Check if user is instructor of the classroom or Admin
        const isOwner = classroom.instructor.toString() === userId;
        const isAdmin = accountType === "admin";

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ success: false, message: "Unauthorized to delete this classroom" });
        }

        // Remove classroom reference from all enrolled students and instructor
        await User.updateMany(
            { classrooms: classroomId },
            { $pull: { classrooms: classroomId } }
        );

        await Classroom.findByIdAndDelete(classroomId);

        return res.status(200).json({
            success: true,
            message: "Classroom deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting classroom:", error);
        return res.status(500).json({ success: false, message: "Failed to delete classroom", error: error.message });
    }
};


// ================ GET ALL CLASSROOMS (Admin only) ================
exports.getAllClassrooms = async (req, res) => {
    try {
        const classrooms = await Classroom.find()
            .populate("instructor", "firstName lastName email")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "All classrooms fetched",
            data: classrooms,
        });
    } catch (error) {
        console.error("Error fetching all classrooms:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch classrooms", error: error.message });
    }
};
