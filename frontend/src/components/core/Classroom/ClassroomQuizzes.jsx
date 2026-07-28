import { useState } from "react";
import { toast } from "react-hot-toast";
import { MdAdd, MdOutlineAssignment, MdLaunch } from "react-icons/md";
import { addQuizToClassroom } from "../../../services/operations/quizAPI";

export default function ClassroomQuizzes({ quizzes = [], isInstructor, classroomId, token, onQuizAdded }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [quizUrl, setQuizUrl] = useState("");
  const [isLive, setIsLive] = useState(false);
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !quizUrl.trim()) {
      toast.error("Please provide both title and quiz form URL");
      return;
    }

    try {
      const urlToTest = quizUrl.trim().startsWith("http")
        ? quizUrl.trim()
        : `https://${quizUrl.trim()}`;
      new URL(urlToTest);
    } catch (err) {
      toast.error("Please enter a valid Quiz URL (e.g., https://forms.google.com/...)");
      return;
    }

    const success = await addQuizToClassroom(
      {
        classroomId,
        title: title.trim(),
        quizUrl: quizUrl.trim().startsWith("http") ? quizUrl.trim() : `https://${quizUrl.trim()}`,
        isLive,
        dueDate: dueDate || null,
      },
      token
    );

    if (success) {
      setTitle("");
      setQuizUrl("");
      setIsLive(false);
      setDueDate("");
      setShowAddForm(false);
      if (onQuizAdded) onQuizAdded();
    }
  };

  return (
    <div className="flex flex-col gap-4 p-6 bg-richblack-800 rounded-xl border border-richblack-700 shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-richblack-5">Class Quizzes & Assessments</h3>
          <p className="text-xs text-richblack-300 mt-1">Easily publish interactive quizzes and assessments with zero coding required.</p>
        </div>
        {isInstructor && (
          <button
            onClick={() => setShowAddForm((p) => !p)}
            className="flex items-center gap-1.5 rounded-lg bg-yellow-50 px-4 py-2 text-sm font-semibold text-richblack-900 hover:bg-yellow-25 transition-all cursor-pointer"
          >
            <MdAdd size={18} /> Add Quiz / Form
          </button>
        )}
      </div>

      {/* Instructor Add Form with Zero-Code Guide */}
      {isInstructor && showAddForm && (
        <form onSubmit={handleSubmit} className="mt-2 space-y-4 rounded-xl border border-richblack-700 bg-richblack-900 p-5 shadow-lg">
          <div className="flex items-center justify-between border-b border-richblack-800 pb-3">
            <p className="text-sm font-bold text-yellow-50 flex items-center gap-2">
              📝 Publish Quiz (No Coding Required)
            </p>
            <span className="text-[11px] bg-caribbeangreen-500/20 text-caribbeangreen-300 px-2.5 py-0.5 rounded-full font-medium border border-caribbeangreen-500/30">
              100% Visual Builder
            </span>
          </div>

          {/* Quick No-Code Builder Guide & 1-Click Launchers */}
          <div className="rounded-lg bg-richblack-800 p-4 border border-richblack-700/80">
            <p className="text-xs font-semibold text-richblack-100 mb-2 flex items-center gap-1.5">
              💡 How to create your quiz visually in 60 seconds:
            </p>
            <ol className="text-xs text-richblack-300 space-y-1 ml-4 list-decimal">
              <li>Click a free builder below to visually write your questions & answers (no code needed).</li>
              <li>Click <strong>Send / Share</strong> inside the builder and copy the Quiz URL.</li>
              <li>Paste your Quiz URL in the form field below and click <strong>Post Quiz</strong>!</li>
            </ol>

            <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 border-t border-richblack-700/60">
              <span className="text-[11px] text-richblack-400 font-medium">Instant Visual Builders:</span>
              <a
                href="https://forms.new"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 bg-yellow-50/10 hover:bg-yellow-50/20 text-yellow-50 border border-yellow-50/30 text-xs px-2.5 py-1 rounded-md transition"
              >
                <MdLaunch size={12} /> Google Forms
              </a>
              <a
                href="https://forms.office.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs px-2.5 py-1 rounded-md transition"
              >
                <MdLaunch size={12} /> Microsoft Forms
              </a>
              <a
                href="https://quizizz.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 bg-caribbeangreen-500/10 hover:bg-caribbeangreen-500/20 text-caribbeangreen-300 border border-caribbeangreen-500/30 text-xs px-2.5 py-1 rounded-md transition"
              >
                <MdLaunch size={12} /> Quizizz
              </a>
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-richblack-200 mb-1">Quiz Title *</label>
            <input
              type="text"
              placeholder="e.g. Chapter 1 Quiz / Mid-term Assessment"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg bg-richblack-800 px-3 py-2 text-sm text-richblack-5 border border-richblack-700 outline-none focus:border-yellow-50"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-richblack-200 mb-1">Quiz / Form URL *</label>
            <input
              type="url"
              placeholder="https://forms.google.com/... or https://quizizz.com/..."
              value={quizUrl}
              onChange={(e) => setQuizUrl(e.target.value)}
              className="w-full rounded-lg bg-richblack-800 px-3 py-2 text-sm text-richblack-5 border border-richblack-700 outline-none focus:border-yellow-50 font-mono text-xs"
              required
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-richblack-200 mb-1">Due Date (Optional)</label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-lg bg-richblack-800 px-3 py-2 text-sm text-richblack-5 border border-richblack-700 outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-4">
              <input
                type="checkbox"
                id="isLiveToggle"
                checked={isLive}
                onChange={(e) => setIsLive(e.target.checked)}
                className="h-4 w-4 rounded accent-yellow-50 cursor-pointer"
              />
              <label htmlFor="isLiveToggle" className="text-xs text-richblack-200 cursor-pointer font-medium">
                Mark as Live Now 🔴
              </label>
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t border-richblack-800">
            <button
              type="submit"
              className="rounded-lg bg-yellow-50 px-5 py-2 text-sm font-semibold text-richblack-900 hover:bg-yellow-25 cursor-pointer shadow-md"
            >
              Publish Quiz
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-sm text-richblack-400 hover:text-richblack-5 px-3 py-2 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Quizzes List */}
      {quizzes.length === 0 ? (
        <div className="py-8 text-center text-richblack-400">
          <MdOutlineAssignment size={40} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">No quizzes posted yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {quizzes.map((quiz, index) => (
            <div
              key={quiz._id || index}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 bg-richblack-900 rounded-lg border border-richblack-700 hover:border-richblack-600 transition"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-richblack-5 text-base">{quiz.title}</h4>
                  {quiz.isLive && (
                    <span className="text-xs bg-pink-200/20 text-pink-200 border border-pink-300/40 px-2 py-0.5 rounded-full font-bold animate-pulse">
                      Live Now 🔴
                    </span>
                  )}
                </div>
                <p className="text-xs text-richblack-400 mt-1">
                  Due: {quiz.dueDate ? new Date(quiz.dueDate).toLocaleString() : "No deadline"}
                </p>
              </div>

              <a
                href={quiz.quizUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-yellow-50 text-richblack-900 font-semibold px-4 py-2 rounded-lg hover:bg-yellow-25 transition text-xs"
              >
                Open Quiz Form <MdLaunch size={14} />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
