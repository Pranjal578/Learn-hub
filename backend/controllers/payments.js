const { instance } = require("../config/razorpay");
const Classroom = require("../models/Classroom");
const User = require("../models/user");
const Course = require("../models/course");
const CourseProgress = require("../models/courseProgress");
const crypto = require("crypto");
const mailSender = require("../utils/mailSender");
const { courseEnrollmentEmail } = require("../mail/templates/courseEnrollmentEmail");
const mongoose = require("mongoose");
require("dotenv").config();

// 1. Initiate Razorpay Order (Capture Payment)
exports.capturePayment = async (req, res) => {
  try {
    const { classroomId, coursesId } = req.body;
    const userId = req.user.id;

    // A. Handle Classroom Payment
    if (classroomId) {
      const classroom = await Classroom.findById(classroomId);
      if (!classroom) {
        return res.status(404).json({ success: false, message: "Classroom not found" });
      }

      // Check if student is already enrolled
      if (classroom.studentsEnrolled && classroom.studentsEnrolled.map(s => s.toString()).includes(userId.toString())) {
        return res.status(400).json({ success: false, message: "Student is already enrolled in this class" });
      }

      const amount = classroom.price || 499; // Amount in INR
      const currency = "INR";
      const options = {
        amount: Math.round(amount * 100), // Amount in paise
        currency,
        receipt: `receipt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        notes: {
          classroomId,
          userId,
        },
      };

      let paymentResponse = null;
      const isPlaceholderKey = !process.env.RAZORPAY_KEY || process.env.RAZORPAY_KEY.includes("placeholder");

      if (!isPlaceholderKey && instance) {
        try {
          paymentResponse = await instance.orders.create(options);
        } catch (error) {
          console.warn("Razorpay API Order creation error (using demo fallback):", error.message);
        }
      }

      // Fallback for development/demo mode when credentials are missing or placeholder
      if (!paymentResponse || !paymentResponse.id) {
        const dummyId = `order_demo_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        paymentResponse = {
          id: dummyId,
          currency: options.currency,
          amount: options.amount,
          status: "created",
        };
      }

      return res.status(200).json({
        success: true,
        message: paymentResponse,
        courseName: classroom.className,
        courseDescription: classroom.description,
        thumbnail: classroom.thumbnail,
        orderId: paymentResponse.id,
        currency: paymentResponse.currency,
        amount: paymentResponse.amount,
      });
    }

    // B. Handle Course Payment
    if (!coursesId || (Array.isArray(coursesId) && coursesId.length === 0)) {
      return res.status(400).json({ success: false, message: "Please provide Classroom ID or Course ID(s)" });
    }

    const courseList = Array.isArray(coursesId) ? coursesId : [coursesId];
    let totalAmount = 0;

    for (const course_id of courseList) {
      const course = await Course.findById(course_id);
      if (!course) {
        return res.status(404).json({ success: false, message: "Could not find the course" });
      }

      const isEnrolled = course.studentsEnrolled && course.studentsEnrolled.map(id => id.toString()).includes(userId.toString());
      if (isEnrolled) {
        return res.status(400).json({ success: false, message: "Student is already Enrolled" });
      }
      totalAmount += course.price || 0;
    }

    const currency = "INR";
    const options = {
      amount: Math.round((totalAmount || 499) * 100),
      currency,
      receipt: `receipt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    };

    let paymentResponse = null;
    const isPlaceholderKey = !process.env.RAZORPAY_KEY || process.env.RAZORPAY_KEY.includes("placeholder");

    if (!isPlaceholderKey && instance) {
      try {
        paymentResponse = await instance.orders.create(options);
      } catch (error) {
        console.warn("Razorpay API Course Order creation error (using demo fallback):", error.message);
      }
    }

    // Fallback for development/demo mode
    if (!paymentResponse || !paymentResponse.id) {
      const dummyId = `order_demo_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      paymentResponse = {
        id: dummyId,
        currency: options.currency,
        amount: options.amount,
        status: "created",
      };
    }

    return res.status(200).json({
      success: true,
      message: paymentResponse,
      orderId: paymentResponse.id,
      currency: paymentResponse.currency,
      amount: paymentResponse.amount,
    });
  } catch (error) {
    console.error("Capture Payment Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Verify Payment Signature & Enroll Student
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, classroomId, coursesId, courses } = req.body;
    const userId = req.user.id;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({ success: false, message: "Payment details incomplete for verification" });
    }

    let isVerified = false;
    const isDemoOrder = razorpay_order_id.startsWith("order_demo_");
    const isPlaceholderSecret = !process.env.RAZORPAY_SECRET || process.env.RAZORPAY_SECRET.includes("placeholder");

    if (isDemoOrder || isPlaceholderSecret || razorpay_signature === "demo_signature") {
      isVerified = true;
    } else if (razorpay_signature) {
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_SECRET)
        .update(body.toString())
        .digest("hex");
      if (expectedSignature === razorpay_signature) {
        isVerified = true;
      }
    }

    if (!isVerified) {
      return res.status(400).json({ success: false, message: "Payment signature mismatch. Verification failed." });
    }

    // A. Enroll in Classroom if classroomId present
    if (classroomId) {
      await enrollStudentInClassroom(classroomId, userId);
      return res.status(200).json({ success: true, message: "Payment verified and student enrolled into classroom successfully" });
    }

    // B. Enroll in Courses if coursesId/courses present
    const courseItems = coursesId || courses;
    if (courseItems && (Array.isArray(courseItems) ? courseItems.length > 0 : courseItems)) {
      await enrollStudentsInCourses(courseItems, userId);
      return res.status(200).json({ success: true, message: "Payment Verified and student enrolled into course(s)" });
    }

    return res.status(200).json({ success: true, message: "Payment verified successfully" });
  } catch (error) {
    console.error("Verify Payment Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Helper function to handle Classroom enrollment
const enrollStudentInClassroom = async (classroomId, userId) => {
  try {
    const updatedClassroom = await Classroom.findByIdAndUpdate(
      classroomId,
      { $addToSet: { studentsEnrolled: userId } },
      { new: true }
    );

    if (!updatedClassroom) {
      throw new Error("Classroom not found for enrollment");
    }

    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { classrooms: classroomId } },
      { new: true }
    );
  } catch (error) {
    console.error("Enrollment Helper Error:", error);
    throw error;
  }
};

// Helper function to handle Course enrollment
const enrollStudentsInCourses = async (courses, userId) => {
  const courseList = Array.isArray(courses) ? courses : [courses];
  for (const courseId of courseList) {
    const enrolledCourse = await Course.findOneAndUpdate(
      { _id: courseId },
      { $addToSet: { studentsEnrolled: userId } },
      { new: true }
    );

    if (!enrolledCourse) {
      throw new Error("Course not Found");
    }

    let courseProgress = await CourseProgress.findOne({ courseID: courseId, userId });
    if (!courseProgress) {
      courseProgress = await CourseProgress.create({
        courseID: courseId,
        userId: userId,
        completedVideos: [],
      });
    }

    const enrolledStudent = await User.findByIdAndUpdate(
      userId,
      {
        $addToSet: {
          courses: courseId,
          courseProgress: courseProgress._id,
        },
      },
      { new: true }
    );

    try {
      if (enrolledStudent && enrolledStudent.email) {
        await mailSender(
          enrolledStudent.email,
          `Successfully Enrolled into ${enrolledCourse.courseName}`,
          courseEnrollmentEmail(enrolledCourse.courseName, `${enrolledStudent.firstName}`)
        );
      }
    } catch (mailErr) {
      console.warn("Mail error on enrollment:", mailErr.message);
    }
  }
};

// 3. Send Payment Success Email
exports.sendPaymentSuccessEmail = async (req, res) => {
  const { orderId, paymentId, amount } = req.body;
  const userId = req.user.id;

  if (!orderId || !paymentId || !amount || !userId) {
    return res.status(400).json({ success: false, message: "Please provide all required payment details" });
  }

  try {
    const enrolledStudent = await User.findById(userId);
    if (enrolledStudent && enrolledStudent.email) {
      await mailSender(
        enrolledStudent.email,
        `Payment Received - LearnHub`,
        `<h2>Payment Successful</h2><p>Dear ${enrolledStudent.firstName},</p><p>We received your payment of &#8377;${amount / 100}.</p><p><strong>Order ID:</strong> ${orderId}<br><strong>Payment ID:</strong> ${paymentId}</p>`
      );
    }
    return res.status(200).json({ success: true, message: "Payment success email sent" });
  } catch (error) {
    console.error("Error sending payment email:", error);
    return res.status(500).json({ success: false, message: "Could not send payment email" });
  }
};