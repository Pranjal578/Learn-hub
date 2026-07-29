const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }], // Stores the option strings (min 3, max 5)
  correctAnswer: { type: String, required: true } // Stores the exact matching string of the correct option
});

const quizSchema = new mongoose.Schema({
  quizName: { type: String, required: true },
  classroomId: { type: mongoose.Schema.Types.ObjectId, ref: "Classroom", required: false },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: false },
  subSectionId: { type: mongoose.Schema.Types.ObjectId, ref: "SubSection", required: false },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  questions: [questionSchema],
  isLive: { type: Boolean, default: true },
  submissions: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    answers: [{ 
      questionId: { type: mongoose.Schema.Types.ObjectId, required: true }, 
      chosenAnswer: { type: String, default: "" },
      isCorrect: { type: Boolean, required: true }
    }],
    submittedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model("Quiz", quizSchema);
