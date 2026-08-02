import { useState } from "react";
import { MdAdd, MdOutlineAssignment, MdPlayArrow, MdCheckCircle, MdVisibility, MdClose } from "react-icons/md";
import QuizBuilder from "../Instructor/QuizBuilder";
import StudentQuizView from "../Student/StudentQuizView";

function InstructorSubmissionsView({ quiz, onClose }) {
  const [expandedStudent, setExpandedStudent] = useState(null);
  const submissions = quiz.allSubmissions || [];

  return (
    <div className="flex flex-col gap-6 p-6 bg-richblack-800 rounded-xl border border-richblack-700 shadow-2xl text-richblack-5 max-w-4xl mx-auto">
      <div className="flex items-center justify-between border-b border-richblack-700 pb-4">
        <div>
          <button
            onClick={onClose}
            className="text-xs text-richblack-400 hover:text-yellow-50 mb-2 cursor-pointer"
          >
            ← Back to Quizzes
          </button>
          <h3 className="text-2xl font-bold text-yellow-50">
            Student Attempt Remarks & Submissions: {quiz.quizName || quiz.title}
          </h3>
          <p className="text-xs text-richblack-300 mt-1">
            Total Submissions: <span className="font-bold text-richblack-100">{submissions.length}</span> student(s) attempted this quiz.
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg bg-richblack-700 hover:bg-richblack-600 text-richblack-300 hover:text-richblack-5 transition cursor-pointer"
        >
          <MdClose size={20} />
        </button>
      </div>

      {submissions.length === 0 ? (
        <div className="py-12 text-center text-richblack-400 space-y-2">
          <MdOutlineAssignment size={44} className="mx-auto opacity-50" />
          <p className="text-base font-semibold">No student attempts recorded yet.</p>
          <p className="text-xs text-richblack-500">
            When students enrolled in your classroom attempt this quiz, their scores, answers, and remarks will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub, sIdx) => {
            const student = sub.student || {};
            const studentName = typeof student === "object" && student.firstName
              ? `${student.firstName} ${student.lastName}`
              : "Enrolled Student";
            const studentEmail = typeof student === "object" && student.email ? student.email : "";
            const studentImg = typeof student === "object" && student.image
              ? student.image
              : `https://api.dicebear.com/5.x/initials/svg?seed=${encodeURIComponent(studentName)}`;

            const score = sub.score ?? 0;
            const total = sub.totalQuestions || quiz.questions?.length || 1;
            const pct = Math.round((score / total) * 100);

            let remarkText = "Needs Improvement";
            let remarkBadgeClass = "bg-pink-900/30 text-pink-300 border-pink-700/40";

            if (pct === 100) {
              remarkText = "🌟 Outstanding (100%)";
              remarkBadgeClass = "bg-yellow-500/20 text-yellow-50 border-yellow-500/40";
            } else if (pct >= 70) {
              remarkText = "✅ Passed / Good Performance";
              remarkBadgeClass = "bg-caribbeangreen-500/20 text-caribbeangreen-300 border-caribbeangreen-500/40";
            } else if (pct >= 40) {
              remarkText = "⚠️ Average / Passed";
              remarkBadgeClass = "bg-blue-500/20 text-blue-300 border-blue-500/40";
            }

            const isExpanded = expandedStudent === sIdx;

            return (
              <div
                key={sub._id || sIdx}
                className="bg-richblack-900 rounded-xl border border-richblack-700 p-5 space-y-4 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={studentImg}
                      alt={studentName}
                      className="h-10 w-10 rounded-full object-cover border border-richblack-700"
                    />
                    <div>
                      <h4 className="font-bold text-richblack-5 text-base">{studentName}</h4>
                      {studentEmail && (
                        <p className="text-xs text-richblack-400">{studentEmail}</p>
                      )}
                      <p className="text-[11px] text-richblack-400 mt-0.5">
                        Attempted: {new Date(sub.submittedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="text-right">
                      <span className="text-xl font-extrabold text-yellow-50">
                        {score} / {total}
                      </span>
                      <span className="text-xs text-richblack-400 block font-medium">
                        ({pct}%)
                      </span>
                    </div>

                    <span
                      className={`text-xs px-3 py-1 rounded-full font-bold border ${remarkBadgeClass}`}
                    >
                      {remarkText}
                    </span>

                    <button
                      onClick={() => setExpandedStudent(isExpanded ? null : sIdx)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-richblack-800 hover:bg-richblack-700 text-blue-100 transition cursor-pointer"
                    >
                      {isExpanded ? "Hide Breakdown" : "View Answers Breakdown"}
                    </button>
                  </div>
                </div>

                {/* Detailed Answer Breakdown */}
                {isExpanded && sub.answers && sub.answers.length > 0 && (
                  <div className="border-t border-richblack-800 pt-4 space-y-3">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-richblack-300">
                      Answer & Response Details:
                    </h5>
                    <div className="space-y-2">
                      {quiz.questions?.map((q, qIdx) => {
                        const ansRec = sub.answers.find(
                          (a) => a.questionId?.toString() === q._id?.toString()
                        );
                        const chosen = ansRec ? ansRec.chosenAnswer : "Not Answered";
                        const isCorrect = ansRec ? ansRec.isCorrect : false;

                        return (
                          <div
                            key={q._id || qIdx}
                            className={`p-3 rounded-lg border text-xs space-y-1.5 ${
                              isCorrect
                                ? "bg-caribbeangreen-500/10 border-caribbeangreen-500/20"
                                : "bg-pink-900/10 border-pink-700/30"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-semibold text-richblack-5">
                                {qIdx + 1}. {q.questionText}
                              </p>
                              <span
                                className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                                  isCorrect
                                    ? "bg-caribbeangreen-500/20 text-caribbeangreen-300"
                                    : "bg-pink-900/30 text-pink-300"
                                }`}
                              >
                                {isCorrect ? "Correct ✓" : "Incorrect ✗"}
                              </span>
                            </div>

                            <p className="text-richblack-300">
                              Student Choice:{" "}
                              <span
                                className={`font-semibold ${
                                  isCorrect ? "text-caribbeangreen-300" : "text-pink-300"
                                }`}
                              >
                                {chosen}
                              </span>
                            </p>
                            {!isCorrect && (
                              <p className="text-caribbeangreen-300 font-medium">
                                Expected Answer:{" "}
                                <span className="font-semibold underline">{q.correctAnswer}</span>
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ClassroomQuizzes({
  quizzes = [],
  isInstructor,
  classroomId,
  token,
  onQuizAdded,
}) {
  const [showBuilder, setShowBuilder] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [viewingSubmissionsQuiz, setViewingSubmissionsQuiz] = useState(null);

  const handleQuizCreated = () => {
    setShowBuilder(false);
    if (onQuizAdded) onQuizAdded();
  };

  const handleQuizSubmitted = () => {
    if (onQuizAdded) onQuizAdded();
  };

  if (viewingSubmissionsQuiz) {
    return (
      <InstructorSubmissionsView
        quiz={viewingSubmissionsQuiz}
        onClose={() => setViewingSubmissionsQuiz(null)}
      />
    );
  }

  if (activeQuiz) {
    return (
      <StudentQuizView
        quiz={activeQuiz}
        token={token}
        onSubmitted={handleQuizSubmitted}
        onClose={() => setActiveQuiz(null)}
      />
    );
  }

  if (showBuilder && isInstructor) {
    return (
      <QuizBuilder
        classroomId={classroomId}
        token={token}
        onSuccess={handleQuizCreated}
        onCancel={() => setShowBuilder(false)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 bg-richblack-800 rounded-xl border border-richblack-700 shadow-md text-richblack-5">
      <div className="flex items-center justify-between border-b border-richblack-700 pb-4">
        <div>
          <h3 className="text-xl font-bold text-richblack-5">
            Classroom Interactive MCQ Quizzes
          </h3>
          <p className="text-xs text-richblack-300 mt-1">
            Attempt quizzes with instant auto-evaluation, position-shuffled options, and detailed answer review.
          </p>
        </div>
        {isInstructor && (
          <button
            onClick={() => setShowBuilder(true)}
            className="flex items-center gap-1.5 rounded-lg bg-yellow-50 px-4 py-2 text-sm font-bold text-richblack-900 hover:bg-yellow-25 transition cursor-pointer shadow-md"
          >
            <MdAdd size={18} /> Create Interactive Quiz
          </button>
        )}
      </div>

      {/* Quizzes List */}
      {quizzes.length === 0 ? (
        <div className="py-12 text-center text-richblack-400">
          <MdOutlineAssignment size={48} className="mx-auto mb-3 opacity-50" />
          <p className="text-base font-medium">No interactive quizzes posted yet.</p>
          <p className="text-xs text-richblack-500 mt-1">
            {isInstructor
              ? "Click 'Create Interactive Quiz' above to add a new MCQ test for your students."
              : "Check back later when your instructor posts a quiz."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {quizzes.map((quiz, index) => {
            const hasSubmitted = quiz.hasSubmitted || !!quiz.mySubmission;
            const score = quiz.mySubmission?.score;
            const totalQuestions = quiz.mySubmission?.totalQuestions || quiz.questions?.length;
            const hasInstructorAccess = Array.isArray(quiz.allSubmissions);

            return (
              <div
                key={quiz._id || index}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 bg-richblack-900 rounded-xl border border-richblack-700 hover:border-richblack-600 transition shadow-sm"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h4 className="font-bold text-richblack-5 text-lg">
                      {quiz.quizName || quiz.title || "Classroom Quiz"}
                    </h4>
                    {quiz.isLive && (
                      <span className="text-[11px] bg-pink-200/20 text-pink-200 border border-pink-300/40 px-2.5 py-0.5 rounded-full font-bold animate-pulse">
                        Live 🔴
                      </span>
                    )}
                    {hasSubmitted && (
                      <span className="text-[11px] bg-caribbeangreen-500/20 text-caribbeangreen-300 border border-caribbeangreen-500/40 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                        <MdCheckCircle size={13} /> Completed
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-richblack-300">
                    Questions: <span className="font-semibold text-richblack-100">{quiz.questions?.length || 0}</span>
                    {hasSubmitted && score !== undefined && (
                      <span className="ml-3 text-caribbeangreen-300 font-semibold">
                        Score: {score} / {totalQuestions}
                      </span>
                    )}
                    {hasInstructorAccess && (
                      <span className="ml-3 text-yellow-100 font-semibold">
                        Submissions: {quiz.allSubmissions.length}
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {hasInstructorAccess && (
                    <button
                      onClick={() => setViewingSubmissionsQuiz(quiz)}
                      className="flex items-center gap-1.5 font-bold px-4 py-2.5 rounded-lg text-xs bg-yellow-50 text-richblack-900 hover:bg-yellow-25 transition cursor-pointer shadow-md"
                    >
                      <MdVisibility size={16} /> Check Student Remarks ({quiz.allSubmissions.length})
                    </button>
                  )}

                  <button
                    onClick={() => setActiveQuiz(quiz)}
                    className={`flex items-center gap-1.5 font-bold px-5 py-2.5 rounded-lg text-xs transition cursor-pointer shadow-md ${
                      hasSubmitted
                        ? "bg-richblack-700 text-richblack-100 hover:bg-richblack-600"
                        : hasInstructorAccess
                        ? "bg-richblack-700 text-richblack-100 hover:bg-richblack-600"
                        : "bg-yellow-50 text-richblack-900 hover:bg-yellow-25"
                    }`}
                  >
                    {hasSubmitted ? (
                      <>View Results & Review</>
                    ) : hasInstructorAccess ? (
                      <>
                        <MdPlayArrow size={16} /> Preview Quiz
                      </>
                    ) : (
                      <>
                        <MdPlayArrow size={16} /> Take Quiz
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
