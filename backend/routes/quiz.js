const express = require("express");
const router = express.Router();

const { auth, isInstructor } = require("../middleware/auth");
const { 
  createQuiz, 
  submitQuiz, 
  getClassroomQuizzes, 
  getQuizById,
  getQuizBySubSection
} = require("../controllers/quizController");

router.post("/create", auth, isInstructor, createQuiz);
router.post("/submit", auth, submitQuiz);
router.get("/classroom/:classroomId", auth, getClassroomQuizzes);
router.get("/subsection/:subSectionId", auth, getQuizBySubSection);
router.get("/:quizId", auth, getQuizById);

module.exports = router;
