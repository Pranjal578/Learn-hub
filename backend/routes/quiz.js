const express = require("express");
const router = express.Router();

const { auth, isInstructor } = require("../middleware/auth");
const { addQuizToClassroom, getClassroomQuizzes } = require("../controllers/quizController");

router.post("/add", auth, isInstructor, addQuizToClassroom);
router.get("/classroom/:classroomId", auth, getClassroomQuizzes);

module.exports = router;
