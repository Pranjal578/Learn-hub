const express = require("express");
const router = express.Router();

const { auth, isAdmin, isInstructor, isStudent } = require("../middleware/auth");

const {
    createClassroom,
    joinClassroom,
    leaveClassroom,
    getClassroomDetails,
    getMyClassrooms,
    postMaterial,
    postNotice,
    createAssignment,
    extendAssignmentDeadline,
    submitAssignment,
    deleteAssignmentSubmission,
    deleteClassroom,
    getAllClassrooms,
} = require("../controllers/classroomController");


// ================================================
//   Instructor / Admin Routes
// ================================================
router.post("/create", auth, isInstructor, createClassroom);
router.post("/post-material", auth, isInstructor, postMaterial);
router.post("/post-notice", auth, isInstructor, postNotice);
router.post("/create-assignment", auth, isInstructor, createAssignment);
router.post("/extend-deadline", auth, isInstructor, extendAssignmentDeadline);
router.delete("/delete", auth, deleteClassroom);

// ================================================
//   Student Routes (require auth + isStudent)
// ================================================
router.post("/join", auth, isStudent, joinClassroom);
router.post("/leave", auth, isStudent, leaveClassroom);
router.post("/submit-assignment", auth, isStudent, submitAssignment);
router.post("/delete-submission", auth, isStudent, deleteAssignmentSubmission);

// ================================================
//   Shared Routes (any authenticated user)
// ================================================
router.post("/details", auth, getClassroomDetails);
router.get("/my-classrooms", auth, getMyClassrooms);
router.get("/all-classrooms", auth, getAllClassrooms);

// ================================================
//   Admin Routes
// ================================================
router.get("/all", auth, isAdmin, getAllClassrooms);


module.exports = router;
