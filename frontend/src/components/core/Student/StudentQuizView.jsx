import { useState, useEffect } from "react";
import { submitQuiz } from "../../../services/operations/quizAPI";
import toast from "react-hot-toast";
import { MdCheckCircle, MdCancel, MdSend, MdOutlineAssignment, MdArrowBack } from "react-icons/md";

export default function StudentQuizView({ quiz, token, onSubmitted, onClose }) {
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submissionResult, setSubmissionResult] = useState(quiz?.mySubmission || null);

  // Shuffle options ONLY on frontend when quiz loads
  useEffect(() => {
    if (quiz && quiz.questions) {
      const randomized = quiz.questions.map((q) => ({
        ...q,
        shuffledOptions: [...q.options].sort(() => Math.random() - 0.5),
      }));
      setShuffledQuestions(randomized);
    }
  }, [quiz]);

  const handleSelectOption = (questionId, optionValue) => {
    if (submissionResult || quiz?.hasSubmitted) return; // Prevent change if submitted
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionValue,
    }));
  };

  const handleSubmit = async () => {
    // Check if student answered all questions
    const unanswered = quiz.questions.filter((q) => !selectedAnswers[q._id]);
    if (unanswered.length > 0) {
      const confirmSubmit = window.confirm(
        `You have ${unanswered.length} unanswered question(s). Are you sure you want to submit?`
      );
      if (!confirmSubmit) return;
    }

    const formattedResponses = Object.keys(selectedAnswers).map((qId) => ({
      questionId: qId,
      chosenAnswer: selectedAnswers[qId],
    }));

    const response = await submitQuiz(
      {
        quizId: quiz._id,
        responses: formattedResponses,
      },
      token
    );

    if (response && response.success) {
      setSubmissionResult(response.submission || {
        score: response.score,
        totalQuestions: response.totalQuestions,
        answers: response.evaluation,
      });
      if (onSubmitted) onSubmitted();
    }
  };

  const isCompleted = !!submissionResult || quiz?.hasSubmitted;

  return (
    <div className="p-6 bg-richblack-800 rounded-xl border border-richblack-700 shadow-2xl text-richblack-5 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-richblack-700 pb-4">
        <div>
          <button
            onClick={onClose}
            className="flex items-center gap-1 text-xs text-richblack-400 hover:text-yellow-50 mb-2 cursor-pointer"
          >
            <MdArrowBack size={14} /> Back to Quizzes
          </button>
          <h2 className="text-2xl font-bold text-yellow-50">{quiz.quizName}</h2>
          <p className="text-xs text-richblack-300 mt-1">
            Total Questions: {quiz.questions?.length || 0}
          </p>
        </div>
        {isCompleted && (
          <span className="bg-caribbeangreen-500/20 text-caribbeangreen-300 border border-caribbeangreen-500/40 text-xs px-3 py-1 rounded-full font-bold">
            Submitted ✓
          </span>
        )}
      </div>

      {!isCompleted ? (
        /* Quiz Attempt Mode */
        <div className="space-y-6">
          {shuffledQuestions.map((q, idx) => (
            <div
              key={q._id}
              className="p-5 bg-richblack-900 rounded-xl border border-richblack-700 space-y-4"
            >
              <p className="font-semibold text-richblack-5 text-base">
                {idx + 1}. {q.questionText}
              </p>
              <div className="flex flex-col gap-2.5">
                {q.shuffledOptions.map((opt, oIdx) => {
                  const isChecked = selectedAnswers[q._id] === opt;
                  return (
                    <label
                      key={oIdx}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        isChecked
                          ? "bg-yellow-50/10 border-yellow-50 text-yellow-50 font-medium"
                          : "bg-richblack-800 border-richblack-700 text-richblack-200 hover:bg-richblack-700"
                      }`}
                    >
                      <input
                        type="radio"
                        name={q._id}
                        value={opt}
                        checked={isChecked}
                        onChange={() => handleSelectOption(q._id, opt)}
                        className="h-4 w-4 accent-yellow-50 cursor-pointer"
                      />
                      <span className="text-sm">{opt}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          <button
            onClick={handleSubmit}
            className="w-full flex items-center justify-center gap-2 bg-yellow-50 text-richblack-900 font-bold py-3 px-6 rounded-lg hover:bg-yellow-25 shadow-lg transition text-base cursor-pointer"
          >
            <MdSend size={20} /> Submit Quiz Answers
          </button>
        </div>
      ) : (
        /* Score & Detailed Review Mode */
        <div className="space-y-6">
          <div className="bg-richblack-900 p-6 rounded-xl border border-richblack-700 text-center space-y-2">
            <h3 className="text-xs uppercase tracking-widest font-semibold text-richblack-400">
              Quiz Evaluation Results
            </h3>
            <p className="text-4xl font-extrabold text-yellow-50">
              {submissionResult?.score} / {submissionResult?.totalQuestions}
            </p>
            <p className="text-xs text-caribbeangreen-300 font-medium">
              Percentage: {Math.round(((submissionResult?.score || 0) / (submissionResult?.totalQuestions || 1)) * 100)}%
            </p>
            <p className="text-[11px] text-richblack-400 pt-2">
              Note: Submissions are final. Resubmission or submission deletion is disabled.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-base font-bold text-richblack-5 border-b border-richblack-700 pb-2">
              Detailed Answer Breakdown
            </h4>

            {quiz.questions.map((q, idx) => {
              // Find submission answer record for this question
              const ansRecord = submissionResult?.answers?.find(
                (a) => a.questionId?.toString() === q._id?.toString()
              );
              const chosen = ansRecord ? ansRecord.chosenAnswer : "";
              const isCorrect = ansRecord ? ansRecord.isCorrect : false;

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border space-y-3 ${
                    isCorrect
                      ? "bg-caribbeangreen-500/10 border-caribbeangreen-500/30"
                      : "bg-pink-900/10 border-pink-700/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-sm text-richblack-5">
                      {idx + 1}. {q.questionText}
                    </p>
                    {isCorrect ? (
                      <span className="flex items-center gap-1 text-xs text-caribbeangreen-300 font-bold bg-caribbeangreen-500/20 px-2.5 py-0.5 rounded-full border border-caribbeangreen-500/30">
                        <MdCheckCircle size={14} /> Correct
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-pink-300 font-bold bg-pink-900/30 px-2.5 py-0.5 rounded-full border border-pink-700/40">
                        <MdCancel size={14} /> Incorrect
                      </span>
                    )}
                  </div>

                  <div className="text-xs space-y-1.5 pt-1">
                    <p className="text-richblack-300">
                      Your Choice:{" "}
                      <span
                        className={`font-semibold ${
                          isCorrect ? "text-caribbeangreen-300" : "text-pink-300"
                        }`}
                      >
                        {chosen || "Not Answered"}
                      </span>
                    </p>
                    {!isCorrect && (
                      <p className="text-caribbeangreen-300 font-medium">
                        Correct Answer: <span className="font-semibold underline">{q.correctAnswer}</span>
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
