import { useState } from "react";
import toast from "react-hot-toast";
import { MdAdd, MdDelete, MdRemoveRedEye, MdEdit, MdCloudUpload } from "react-icons/md";
import { createQuiz } from "../../../services/operations/quizAPI";

export default function QuizBuilder({ classroomId, courseId, subSectionId, token, onSuccess, onCancel }) {
  const [quizName, setQuizName] = useState("");
  const [questions, setQuestions] = useState([
    { questionText: "", options: ["", "", ""], correctAnswer: "" }
  ]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { questionText: "", options: ["", "", ""], correctAnswer: "" }
    ]);
  };

  const handleRemoveQuestion = (qIndex) => {
    if (questions.length <= 1) {
      toast.error("Quiz must have at least one question.");
      return;
    }
    const updated = questions.filter((_, idx) => idx !== qIndex);
    setQuestions(updated);
  };

  const handleQuestionTextChange = (qIndex, text) => {
    const updated = [...questions];
    updated[qIndex].questionText = text;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    // Enforce 1st option as automatically set correct answer
    if (oIndex === 0) {
      updated[qIndex].correctAnswer = value;
    }
    setQuestions(updated);
  };

  const handleAddOptionSlot = (qIndex) => {
    const updated = [...questions];
    if (updated[qIndex].options.length < 5) {
      updated[qIndex].options.push("");
      setQuestions(updated);
    } else {
      toast.error("Maximum 5 options allowed per question.");
    }
  };

  const handleRemoveOptionSlot = (qIndex, oIndex) => {
    const updated = [...questions];
    if (updated[qIndex].options.length <= 3) {
      toast.error("Minimum 3 options required per question.");
      return;
    }
    updated[qIndex].options.splice(oIndex, 1);
    // Re-assign correct answer if option 0 changed
    updated[qIndex].correctAnswer = updated[qIndex].options[0] || "";
    setQuestions(updated);
  };

  const validateQuiz = () => {
    if (!quizName.trim()) {
      toast.error("Please enter a Quiz title");
      return false;
    }
    if (questions.length === 0) {
      toast.error("Please add at least one question");
      return false;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        toast.error(`Question ${i + 1} text is required`);
        return false;
      }
      if (q.options.length < 3 || q.options.length > 5) {
        toast.error(`Question ${i + 1} must have between 3 and 5 options`);
        return false;
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].trim()) {
          toast.error(`Question ${i + 1}, Option ${j + 1} cannot be empty`);
          return false;
        }
      }
    }
    return true;
  };

  const handlePreviewToggle = () => {
    if (!isPreviewMode) {
      if (!validateQuiz()) return;
    }
    setIsPreviewMode(!isPreviewMode);
  };

  const handlePublish = async () => {
    if (!validateQuiz()) return;

    // Format questions array ensuring Option 1 is set as correctAnswer
    const formattedQuestions = questions.map((q) => ({
      questionText: q.questionText.trim(),
      options: q.options.map((opt) => opt.trim()),
      correctAnswer: q.options[0].trim(),
    }));

    const result = await createQuiz(
      {
        quizName: quizName.trim(),
        classroomId: classroomId || null,
        courseId: courseId || null,
        subSectionId: subSectionId || null,
        questions: formattedQuestions,
      },
      token
    );

    if (result && onSuccess) {
      onSuccess(result);
    }
  };

  return (
    <div className="p-6 bg-richblack-800 rounded-xl border border-richblack-700 shadow-xl text-richblack-5 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-richblack-700 pb-4 gap-2">
        <div>
          <h2 className="text-2xl font-bold text-yellow-50 flex items-center gap-2">
            📝 Create Interactive MCQ Quiz
          </h2>
          <p className="text-xs text-richblack-300 mt-1">
            Build live interactive quizzes. Option 1 is automatically enforced as the correct answer.
          </p>
        </div>
        <span className="text-xs bg-caribbeangreen-500/20 text-caribbeangreen-300 border border-caribbeangreen-500/30 px-3 py-1 rounded-full font-semibold">
          Automatic Evaluation
        </span>
      </div>

      {/* Quiz Name Input */}
      <div>
        <label className="block text-xs font-semibold text-richblack-200 uppercase tracking-wider mb-2">
          Quiz Title *
        </label>
        <input
          type="text"
          placeholder="e.g. Chapter 1 Assessment / Mid-Term Quiz"
          value={quizName}
          onChange={(e) => setQuizName(e.target.value)}
          disabled={isPreviewMode}
          className="w-full p-3 bg-richblack-900 rounded-lg border border-richblack-700 focus:border-yellow-50 outline-none text-richblack-5 text-sm font-medium"
        />
      </div>

      {!isPreviewMode ? (
        /* Edit Mode */
        <div className="space-y-6">
          {questions.map((q, qIdx) => (
            <div
              key={qIdx}
              className="p-5 bg-richblack-900 rounded-xl border border-richblack-700 space-y-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-yellow-50 uppercase tracking-wider">
                  Question {qIdx + 1}
                </span>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(qIdx)}
                    className="text-xs text-pink-300 hover:text-pink-100 flex items-center gap-1 bg-pink-900/30 px-2.5 py-1 rounded border border-pink-700/50"
                  >
                    <MdDelete size={14} /> Remove Question
                  </button>
                )}
              </div>

              <div>
                <input
                  type="text"
                  placeholder={`Write Question ${qIdx + 1}...`}
                  value={q.questionText}
                  onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                  className="w-full p-3 bg-richblack-800 rounded-lg border border-richblack-700 text-sm outline-none focus:border-yellow-50 text-richblack-5"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-richblack-300">
                    Answer Options (Min 3, Max 5):
                  </p>
                  <span className="text-[11px] text-yellow-50 font-medium">
                    📌 Option 1 is automatically saved as the Correct Answer
                  </span>
                </div>

                {q.options.map((opt, oIdx) => (
                  <div key={oIdx} className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-2 py-1.5 rounded min-w-[70px] text-center ${
                        oIdx === 0
                          ? "bg-caribbeangreen-500/20 text-caribbeangreen-300 border border-caribbeangreen-500/40"
                          : "bg-richblack-800 text-richblack-400 border border-richblack-700"
                      }`}
                    >
                      {oIdx === 0 ? "Opt 1 (✓)" : `Opt ${oIdx + 1}`}
                    </span>
                    <input
                      type="text"
                      placeholder={`Enter text for Option ${oIdx + 1}...`}
                      value={opt}
                      onChange={(e) => handleOptionChange(qIdx, oIdx, e.target.value)}
                      className={`flex-1 p-2.5 bg-richblack-800 rounded-lg border text-xs outline-none ${
                        oIdx === 0
                          ? "border-caribbeangreen-500/50 text-richblack-5"
                          : "border-richblack-700 text-richblack-5 focus:border-yellow-50"
                      }`}
                    />
                    {q.options.length > 3 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOptionSlot(qIdx, oIdx)}
                        className="text-richblack-400 hover:text-pink-300 p-1"
                        title="Delete option"
                      >
                        <MdDelete size={16} />
                      </button>
                    )}
                  </div>
                ))}

                {q.options.length < 5 && (
                  <button
                    type="button"
                    onClick={() => handleAddOptionSlot(qIdx)}
                    className="text-xs text-yellow-50 hover:underline flex items-center gap-1 pt-1 font-medium"
                  >
                    <MdAdd size={16} /> Add Option (Max 5)
                  </button>
                )}
              </div>
            </div>
          ))}

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-richblack-700">
            <button
              type="button"
              onClick={handleAddQuestion}
              className="flex items-center gap-1.5 rounded-lg bg-richblack-700 px-4 py-2.5 text-sm font-semibold text-richblack-100 hover:bg-richblack-600 transition"
            >
              <MdAdd size={18} /> Add Question
            </button>

            <div className="flex items-center gap-3">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="rounded-lg bg-richblack-700 px-4 py-2.5 text-sm font-semibold text-richblack-300 hover:text-richblack-5"
                >
                  Cancel
                </button>
              )}
              <button
                type="button"
                onClick={handlePreviewToggle}
                className="flex items-center gap-1.5 rounded-lg bg-yellow-50 px-5 py-2.5 text-sm font-bold text-richblack-900 hover:bg-yellow-25 shadow-md"
              >
                <MdRemoveRedEye size={18} /> Preview Quiz
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Preview Mode */
        <div className="space-y-6">
          <div className="bg-richblack-900 p-6 rounded-xl border border-richblack-700 space-y-4">
            <div className="flex items-center justify-between border-b border-richblack-800 pb-3">
              <h3 className="text-xl font-bold text-yellow-50">
                Preview: {quizName}
              </h3>
              <span className="text-xs text-richblack-400 font-mono">
                {questions.length} Question{questions.length > 1 ? "s" : ""}
              </span>
            </div>

            {questions.map((q, idx) => (
              <div
                key={idx}
                className="p-4 bg-richblack-800 rounded-lg border border-richblack-700/80 space-y-3"
              >
                <p className="font-semibold text-sm text-richblack-5">
                  {idx + 1}. {q.questionText}
                </p>
                <div className="grid grid-cols-1 gap-2 pl-2">
                  {q.options.map((opt, oIdx) => (
                    <div
                      key={oIdx}
                      className={`p-2.5 rounded-md text-xs flex items-center justify-between border ${
                        oIdx === 0
                          ? "bg-caribbeangreen-500/10 border-caribbeangreen-500/40 text-caribbeangreen-300 font-medium"
                          : "bg-richblack-900 border-richblack-700 text-richblack-300"
                      }`}
                    >
                      <span>{opt}</span>
                      {oIdx === 0 && (
                        <span className="text-[10px] bg-caribbeangreen-500/20 text-caribbeangreen-300 px-2 py-0.5 rounded font-bold uppercase">
                          Correct Answer
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <button
              type="button"
              onClick={handlePreviewToggle}
              className="flex items-center gap-1.5 rounded-lg bg-richblack-700 px-5 py-2.5 text-sm font-semibold text-richblack-100 hover:bg-richblack-600 transition"
            >
              <MdEdit size={18} /> Edit Quiz
            </button>

            <button
              type="button"
              onClick={handlePublish}
              className="flex items-center gap-1.5 rounded-lg bg-caribbeangreen-400 px-6 py-2.5 text-sm font-bold text-richblack-900 hover:bg-caribbeangreen-300 shadow-md transition"
            >
              <MdCloudUpload size={18} /> Post Quiz Live
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
