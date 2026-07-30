const Certificate = require("../models/Certificate");
const Classroom = require("../models/Classroom");
const Course = require("../models/course");
const CourseProgress = require("../models/courseProgress");
const Section = require("../models/section");
const SubSection = require("../models/subSection");
const crypto = require("crypto");

// ================  Generate Classroom Certificate ================
// Only for students enrolled in a classroom
exports.generateCertificate = async (req, res) => {
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

    // Verify student is enrolled or is instructor/admin
    const isEnrolled = classroom.studentsEnrolled.some(
      (id) => id.toString() === studentId.toString()
    );

    if (!isEnrolled && req.user.accountType === "Student") {
      return res.status(403).json({ success: false, message: "Student is not enrolled in this classroom" });
    }

    // Check if certificate already exists
    let certificate = await Certificate.findOne({ student: studentId, classroom: classroomId, type: "classroom" })
      .populate("student", "firstName lastName email image")
      .populate("classroom", "className description duration")
      .populate("instructor", "firstName lastName email");

    if (certificate) {
      return res.status(200).json({
        success: true,
        message: "Certificate already issued",
        data: certificate
      });
    }

    const certificateCode = "CERT-" + crypto.randomBytes(4).toString("hex").toUpperCase();
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    certificate = await Certificate.create({
      student: studentId,
      classroom: classroomId,
      type: "classroom",
      instructor: classroom.instructor,
      certificateCode,
      certificateUrl: `${frontendUrl}/verify-certificate/${certificateCode}`
    });

    certificate = await Certificate.findById(certificate._id)
      .populate("student", "firstName lastName email image")
      .populate("classroom", "className description duration")
      .populate("instructor", "firstName lastName email");

    return res.status(201).json({
      success: true,
      message: "Certificate generated successfully",
      data: certificate
    });
  } catch (error) {
    console.error("Error generating classroom certificate:", error);
    return res.status(500).json({ success: false, message: "Error generating classroom certificate" });
  }
};


// ================  Generate Course Completion Certificate ================
// Only for students who are enrolled AND have completed 100% of all lectures
exports.generateCourseCertificate = async (req, res) => {
  try {
    const { courseId } = req.body;
    const studentId = req.user.id;

    if (!courseId) {
      return res.status(400).json({ success: false, message: "Course ID is required" });
    }

    // 1. Verify the course exists
    const course = await Course.findById(courseId)
      .populate({
        path: "courseContent",
        populate: { path: "subSection" }
      })
      .populate("instructor", "firstName lastName email");

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // 2. Verify student is enrolled in the course
    const isEnrolled = course.studentsEnrolled.some(
      (id) => id.toString() === studentId.toString()
    );

    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: "You are not enrolled in this course"
      });
    }

    // 3. Count total subsections (lectures) in this course
    let totalSubSections = 0;
    course.courseContent.forEach((section) => {
      totalSubSections += section.subSection ? section.subSection.length : 0;
    });

    if (totalSubSections === 0) {
      return res.status(400).json({
        success: false,
        message: "This course has no lectures yet"
      });
    }

    // 4. Check how many lectures this student has completed
    const courseProgress = await CourseProgress.findOne({
      courseID: courseId,
      userId: studentId
    });

    const completedCount = courseProgress ? courseProgress.completedVideos.length : 0;

    if (completedCount < totalSubSections) {
      const remaining = totalSubSections - completedCount;
      return res.status(403).json({
        success: false,
        message: `You must complete all lectures to get a certificate. ${remaining} lecture(s) remaining (${completedCount}/${totalSubSections} completed).`,
        data: {
          completed: completedCount,
          total: totalSubSections,
          percentage: Math.round((completedCount / totalSubSections) * 100)
        }
      });
    }

    // 5. Check if certificate already exists for this student + course
    let certificate = await Certificate.findOne({ student: studentId, course: courseId, type: "course" })
      .populate("student", "firstName lastName email image")
      .populate("course", "courseName courseDescription")
      .populate("instructor", "firstName lastName email");

    if (certificate) {
      return res.status(200).json({
        success: true,
        message: "Certificate already issued",
        data: certificate
      });
    }

    // 6. Generate the certificate
    const certificateCode = "CERT-" + crypto.randomBytes(4).toString("hex").toUpperCase();
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    certificate = await Certificate.create({
      student: studentId,
      course: courseId,
      type: "course",
      instructor: course.instructor._id,
      certificateCode,
      certificateUrl: `${frontendUrl}/verify-certificate/${certificateCode}`
    });

    certificate = await Certificate.findById(certificate._id)
      .populate("student", "firstName lastName email image")
      .populate("course", "courseName courseDescription")
      .populate("instructor", "firstName lastName email");

    return res.status(201).json({
      success: true,
      message: "Course completion certificate generated successfully!",
      data: certificate
    });
  } catch (error) {
    console.error("Error generating course certificate:", error);
    return res.status(500).json({ success: false, message: "Error generating course certificate" });
  }
};


// ================  Verify Certificate (Public) ================
exports.verifyCertificate = async (req, res) => {
  try {
    const { code } = req.params;

    const certificate = await Certificate.findOne({ certificateCode: code.toUpperCase() })
      .populate("student", "firstName lastName email image")
      .populate("classroom", "className description duration")
      .populate("course", "courseName courseDescription")
      .populate("instructor", "firstName lastName email");

    if (!certificate) {
      return res.status(404).json({ success: false, message: "Certificate not found or invalid code" });
    }

    return res.status(200).json({
      success: true,
      data: certificate
    });
  } catch (error) {
    console.error("Error verifying certificate:", error);
    return res.status(500).json({ success: false, message: "Error verifying certificate" });
  }
};
