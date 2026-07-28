const Classroom = require("../models/Classroom");

// Instructor adds a quiz/form link to the classroom
exports.addQuizToClassroom = async (req, res) => {
  try {
    const { classroomId, title, quizUrl, isLive, dueDate } = req.body;

    if (!classroomId || !title || !quizUrl) {
      return res.status(400).json({ success: false, message: "Missing required quiz details" });
    }

    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({ success: false, message: "Classroom not found" });
    }

    const newQuiz = {
      title,
      quizUrl,
      isLive: Boolean(isLive),
      dueDate: dueDate ? new Date(dueDate) : null
    };

    classroom.quizzes.push(newQuiz);
    await classroom.save();

    return res.status(200).json({
      success: true,
      message: "Quiz added successfully",
      data: classroom.quizzes
    });
  } catch (error) {
    console.error("Error adding quiz:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Fetch all quizzes for a given classroom
exports.getClassroomQuizzes = async (req, res) => {
  try {
    const { classroomId } = req.params;
    const classroom = await Classroom.findById(classroomId).select("quizzes className");

    if (!classroom) {
      return res.status(404).json({ success: false, message: "Classroom not found" });
    }

    return res.status(200).json({
      success: true,
      data: classroom.quizzes || []
    });
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
