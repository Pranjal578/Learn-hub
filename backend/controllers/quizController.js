const Quiz = require("../models/Quiz");
const Classroom = require("../models/Classroom");
const SubSection = require("../models/subSection");

// Instructor Creates & Publishes Quiz (Classroom or Course SubSection)
exports.createQuiz = async (req, res) => {
  try {
    const { quizName, classroomId, courseId, subSectionId, questions } = req.body;
    const instructorId = req.user.id;

    if (!quizName || !questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ success: false, message: "Quiz name and valid questions are required" });
    }

    if (!classroomId && !courseId && !subSectionId) {
      return res.status(400).json({ success: false, message: "Quiz must be associated with a Classroom, Course, or SubSection" });
    }

    if (classroomId) {
      const classroom = await Classroom.findById(classroomId);
      if (!classroom) {
        return res.status(404).json({ success: false, message: "Classroom not found" });
      }
      const isInstructor = classroom.instructor.toString() === instructorId.toString();
      const isAdmin = (req.user.accountType || "").toLowerCase() === "admin";
      if (!isInstructor && !isAdmin) {
        return res.status(403).json({ success: false, message: "Only the classroom instructor or admin can create quizzes for this classroom." });
      }
    }

    // Validate questions and options length (min 3, max 5)
    for (const q of questions) {
      if (!q.questionText || !q.questionText.trim()) {
        return res.status(400).json({ success: false, message: "Each question must have valid question text." });
      }
      if (!q.options || !Array.isArray(q.options) || q.options.length < 3 || q.options.length > 5) {
        return res.status(400).json({ success: false, message: "Each question must have between 3 and 5 options." });
      }
      for (const opt of q.options) {
        if (opt === undefined || opt === null || opt.toString().trim() === "") {
          return res.status(400).json({ success: false, message: "Options cannot be empty." });
        }
      }
      if (!q.correctAnswer || !q.correctAnswer.trim()) {
        return res.status(400).json({ success: false, message: "Correct answer must be specified." });
      }
    }

    const newQuiz = await Quiz.create({
      quizName: quizName.trim(),
      classroomId: classroomId || null,
      courseId: courseId || null,
      subSectionId: subSectionId || null,
      instructor: instructorId,
      questions,
      isLive: true
    });

    // If attached to a course SubSection, update SubSection document
    if (subSectionId) {
      await SubSection.findByIdAndUpdate(
        subSectionId,
        {
          isQuiz: true,
          quizId: newQuiz._id,
          quizUrl: `/quiz/${newQuiz._id}`
        },
        { new: true }
      );
    }

    return res.status(201).json({
      success: true,
      message: "Quiz created and published live successfully",
      data: newQuiz
    });
  } catch (error) {
    console.error('Error creating quiz:', error);
    return res.status(500).json({ success: false, message: 'Failed to create quiz. Please try again.' });
  }
};

// Student Submits Quiz & Auto-Evaluates (Value-Based)
exports.submitQuiz = async (req, res) => {
  try {
    const { quizId, responses } = req.body; // responses format: [{ questionId, chosenAnswer }]
    const studentId = req.user.id;

    if (!quizId || !Array.isArray(responses)) {
      return res.status(400).json({ success: false, message: "Quiz ID and responses are required." });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found" });

    // Check if quiz belongs to a classroom and if student is enrolled
    if (quiz.classroomId) {
      const classroom = await Classroom.findById(quiz.classroomId);
      if (!classroom) {
        return res.status(404).json({ success: false, message: "Associated classroom not found." });
      }
      const isEnrolled = classroom.studentsEnrolled.some(s => s.toString() === studentId.toString());
      if (!isEnrolled) {
        return res.status(403).json({
          success: false,
          message: "You must be enrolled in this classroom to submit this quiz."
        });
      }
    }

    // Check if student already submitted
    const alreadySubmitted = quiz.submissions.some(sub => sub.student.toString() === studentId.toString());
    if (alreadySubmitted) {
      return res.status(400).json({ 
        success: false, 
        message: "You have already submitted this quiz. Resubmission or submission deletion is not allowed." 
      });
    }

    let score = 0;
    const evaluatedAnswers = [];

    quiz.questions.forEach((question) => {
      const studentResponse = responses.find(r => r.questionId.toString() === question._id.toString());
      const chosenAnswer = studentResponse && studentResponse.chosenAnswer ? studentResponse.chosenAnswer.toString() : "";
      
      // Strict value-based evaluation
      const isCorrect = chosenAnswer.trim() === question.correctAnswer.trim();
      if (isCorrect) score += 1;

      evaluatedAnswers.push({
        questionId: question._id,
        chosenAnswer,
        isCorrect
      });
    });

    const submissionData = {
      student: studentId,
      score,
      totalQuestions: quiz.questions.length,
      answers: evaluatedAnswers
    };

    quiz.submissions.push(submissionData);
    await quiz.save();

    return res.status(200).json({
      success: true,
      message: "Quiz submitted successfully",
      score,
      totalQuestions: quiz.questions.length,
      evaluation: evaluatedAnswers,
      submission: submissionData
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit quiz. Please try again.' });
  }
};

// Fetch all quizzes for a given classroom (enrolled students, instructor, or admin only)
exports.getClassroomQuizzes = async (req, res) => {
  try {
    const { classroomId } = req.params;
    const userId = req.user.id;
    const accountType = (req.user.accountType || "").toLowerCase();

    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({ success: false, message: "Classroom not found" });
    }

    const isEnrolled = classroom.studentsEnrolled.some(s => s.toString() === userId.toString());
    const isClassroomInstructor = classroom.instructor.toString() === userId.toString();
    const isAdmin = accountType === "admin";

    if (!isEnrolled && !isClassroomInstructor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Quizzes are only available for students enrolled in this classroom."
      });
    }

    const quizzes = await Quiz.find({ classroomId })
      .populate("submissions.student", "firstName lastName email image")
      .sort({ createdAt: -1 });

    const result = quizzes.map(q => {
      const quizObj = q.toObject();
      const userSubmission = quizObj.submissions?.find(
        sub => (sub.student?._id || sub.student)?.toString() === userId.toString()
      );
      
      const isQuizCreator = quizObj.instructor?.toString() === userId.toString();
      const canViewAllSubmissions = isQuizCreator || isClassroomInstructor || isAdmin;

      return {
        ...quizObj,
        hasSubmitted: !!userSubmission,
        mySubmission: userSubmission || null,
        allSubmissions: canViewAllSubmissions ? quizObj.submissions || [] : undefined
      };
    });

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching classroom quizzes:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch quizzes. Please try again.' });
  }
};

// Fetch single quiz details by ID
exports.getQuizById = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.id;
    const accountType = (req.user.accountType || "").toLowerCase();

    const quiz = await Quiz.findById(quizId).populate("submissions.student", "firstName lastName email image");
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }

    let isClassroomInstructor = false;
    const isQuizCreator = quiz.instructor?.toString() === userId.toString();
    const isAdmin = accountType === "admin";

    if (quiz.classroomId) {
      const classroom = await Classroom.findById(quiz.classroomId);
      if (classroom) {
        isClassroomInstructor = classroom.instructor.toString() === userId.toString();
        const isEnrolled = classroom.studentsEnrolled.some(s => s.toString() === userId.toString());
        if (!isEnrolled && !isClassroomInstructor && !isAdmin && !isQuizCreator) {
          return res.status(403).json({
            success: false,
            message: "Access denied. Quizzes are only for students enrolled in the classroom."
          });
        }
      }
    }

    const quizObj = quiz.toObject();
    const userSubmission = quizObj.submissions?.find(
      sub => (sub.student?._id || sub.student)?.toString() === userId.toString()
    );

    const canViewAllSubmissions = isQuizCreator || isClassroomInstructor || isAdmin;

    return res.status(200).json({
      success: true,
      data: {
        ...quizObj,
        hasSubmitted: !!userSubmission,
        mySubmission: userSubmission || null,
        allSubmissions: canViewAllSubmissions ? quizObj.submissions || [] : undefined
      }
    });
  } catch (error) {
    console.error('Error fetching quiz by ID:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch quiz. Please try again.' });
  }
};

// Fetch quiz attached to a course SubSection
exports.getQuizBySubSection = async (req, res) => {
  try {
    const { subSectionId } = req.params;
    const userId = req.user.id;

    const quiz = await Quiz.findOne({ subSectionId });
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Interactive quiz not found for this subSection" });
    }

    const quizObj = quiz.toObject();
    const userSubmission = quizObj.submissions?.find(sub => sub.student.toString() === userId.toString());

    return res.status(200).json({
      success: true,
      data: {
        ...quizObj,
        hasSubmitted: !!userSubmission,
        mySubmission: userSubmission || null
      }
    });
  } catch (error) {
    console.error('Error fetching quiz by SubSection:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch quiz. Please try again.' });
  }
};
