import { useState } from "react";
import { MdAdd, MdOutlineAssignment, MdPlayArrow, MdCheckCircle } from "react-icons/md";
import QuizBuilder from "../Instructor/QuizBuilder";
import StudentQuizView from "../Student/StudentQuizView";

export default function ClassroomQuizzes({
  quizzes = [],
  isInstructor,
  classroomId,
  token,
  onQuizAdded,
}) {
  const [showBuilder, setShowBuilder] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState(null);

  const handleQuizCreated = () => {
    setShowBuilder(false);
    if (onQuizAdded) onQuizAdded();
  };

  const handleQuizSubmitted = () => {
    if (onQuizAdded) onQuizAdded();
  };

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
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveQuiz(quiz)}
                    className={`flex items-center gap-1.5 font-bold px-5 py-2.5 rounded-lg text-xs transition cursor-pointer shadow-md ${
                      hasSubmitted
                        ? "bg-richblack-700 text-richblack-100 hover:bg-richblack-600"
                        : "bg-yellow-50 text-richblack-900 hover:bg-yellow-25"
                    }`}
                  >
                    {hasSubmitted ? (
                      <>View Results & Review</>
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
