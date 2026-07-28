const express = require("express");
const router = express.Router();

const { auth, isStudent } = require("../middleware/auth");
const { generateCertificate, generateCourseCertificate, verifyCertificate } = require("../controllers/certificateController");

// Classroom-based certificate (for any enrolled member)
router.post("/generate", auth, generateCertificate);

// Course-based certificate (only for students who completed 100% of the course)
router.post("/generate-course", auth, isStudent, generateCourseCertificate);

// Public endpoint to verify any certificate by code
router.get("/verify/:code", verifyCertificate);

module.exports = router;
