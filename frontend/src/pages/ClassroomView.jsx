import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { fetchClassroomDetails } from "../services/operations/classroomAPI";
import {
  postMaterial,
  postNotice,
  createAssignment,
  extendDeadline,
  submitAssignment,
  deleteSubmission,
} from "../services/operations/classroomAPI";
import { clearClassroom } from "../slices/classroomSlice";
import { ACCOUNT_TYPE } from "../utils/constants";
import {
  MdOutlineClass,
  MdContentCopy,
  MdDone,
  MdAnnouncement,
  MdAssignment,
  MdBook,
  MdGroup,
  MdAdd,
  MdUploadFile,
  MdCalendarToday,
} from "react-icons/md";

import FilePreviewModal from "../components/common/FilePreviewModal";
import { openFileResource } from "../utils/fileViewer";
import ClassroomQuizzes from "../components/core/Classroom/ClassroomQuizzes";
import { fetchClassroomQuizzes } from "../services/operations/quizAPI";

// ======================== TAB BUTTON ========================
function TabBtn({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
        active
          ? "bg-yellow-50 text-richblack-900"
          : "text-richblack-300 hover:bg-richblack-700 hover:text-richblack-5"
      }`}
    >
      {label}
    </button>
  );
}

// ======================== NOTICE CARD ========================
function NoticeCard({ notice }) {
  return (
    <div className="flex gap-3 rounded-xl border border-richblack-700 bg-richblack-800 p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-yellow-50/10 text-yellow-50">
        <MdAnnouncement size={20} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-richblack-5">{notice.message}</p>
        <p className="mt-1 text-xs text-richblack-400">
          {new Date(notice.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}

// ======================== MATERIAL CARD ========================
function MaterialCard({ material, onPreview }) {
  const getIcon = (type) => {
    switch (type) {
      case "pdf":
        return "📄";
      case "image":
        return "🖼️";
      case "link":
        return "🔗";
      default:
        return "📝";
    }
  };

  return (
    <div className="rounded-xl border border-richblack-700 bg-richblack-800 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getIcon(material.type)}</span>
          <h3 className="font-semibold text-richblack-5">{material.title}</h3>
        </div>
        <span className="rounded-full bg-richblack-700 px-2 py-0.5 text-xs text-richblack-300 uppercase">
          {material.type}
        </span>
      </div>

      {material.textBody && (
        <p className="mt-2 text-sm text-richblack-300 whitespace-pre-wrap">{material.textBody}</p>
      )}

      {material.contentUrl && (
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPreview(material.contentUrl, material.title)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-richblack-700 px-3 py-1.5 text-xs font-semibold text-blue-100 hover:bg-richblack-600 transition-all cursor-pointer"
          >
            <span>Preview Resource</span> →
          </button>

          <a
            href={material.contentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-richblack-400 hover:text-richblack-25 underline"
          >
            External Link
          </a>
        </div>
      )}
    </div>
  );
}

// ======================== ASSIGNMENT CARD ========================
function AssignmentCard({ assignment, isInstructor, classroomId, token, dispatch, userId, onPreview }) {
  const [showExtend, setShowExtend] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [subMode, setSubMode] = useState("file"); // "file" | "url"
  const [subUrl, setSubUrl] = useState("");
  const [subFile, setSubFile] = useState(null);
  const [showSubmit, setShowSubmit] = useState(false);
  const [showSubmissionsList, setShowSubmissionsList] = useState(false);

  const isPast = new Date() > new Date(assignment.dueDate);
  const mySubmission = assignment.submissions?.find(
    (s) => (s.student?._id || s.student) === userId
  );

  const handleSubmit = () => {
    if (subMode === "file") {
      if (!subFile) {
        toast.error("Please select a PDF file to upload");
        return;
      }
      const isPdf = subFile.type === "application/pdf" || subFile.name?.toLowerCase().endsWith(".pdf");
      if (!isPdf) {
        toast.error("Only PDF files (.pdf) are allowed for assignment submission");
        return;
      }
      if (subFile.size > 10 * 1024 * 1024) {
        toast.error("File size must not exceed 10 MB limit");
        return;
      }
      const formData = new FormData();
      formData.append("classroomId", classroomId);
      formData.append("assignmentId", assignment._id);
      formData.append("submissionFile", subFile);
      dispatch(submitAssignment(formData, token));
    } else {
      if (!subUrl.trim()) {
        toast.error("Please enter a PDF submission URL");
        return;
      }
      const isPdfUrl = subUrl.toLowerCase().includes(".pdf") || subUrl.startsWith("data:application/pdf");
      if (!isPdfUrl) {
        toast.error("Submission URL must point to a PDF file (.pdf)");
        return;
      }
      dispatch(
        submitAssignment(
          { classroomId, assignmentId: assignment._id, submissionUrl: subUrl },
          token
        )
      );
    }
    setShowSubmit(false);
    setSubFile(null);
    setSubUrl("");
  };

  return (
    <div className="rounded-xl border border-richblack-700 bg-richblack-800 p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium text-richblack-5">{assignment.title}</p>
          {assignment.description && (
            <p className="mt-1 text-sm text-richblack-300">{assignment.description}</p>
          )}
          {assignment.fileUrl && (
            <div className="mt-2">
              <button
                type="button"
                onClick={() => onPreview(assignment.fileUrl, `${assignment.title} PDF`)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-richblack-700 px-3 py-1.5 text-xs font-semibold text-blue-100 hover:bg-richblack-600 transition-all cursor-pointer"
              >
                <span>📄 View Assignment Attachment / PDF</span> →
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {mySubmission && (
            <span className="rounded-full bg-blue-900 px-2 py-0.5 text-xs font-medium text-blue-200">
              Submitted
            </span>
          )}
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
              isPast ? "bg-red-900 text-red-200" : "bg-green-900 text-green-200"
            }`}
          >
            {isPast ? "Closed" : "Open"}
          </span>
        </div>
      </div>
      <p className="mt-2 flex items-center gap-1 text-xs text-richblack-400">
        <MdCalendarToday size={12} />
        Due: {new Date(assignment.dueDate).toLocaleString()}
      </p>

      <div className="mt-2 flex items-center justify-between">
        <p className="text-xs text-richblack-400">
          Submissions: <span className="font-semibold text-richblack-200">{assignment.submissions?.length ?? 0}</span>
        </p>
        {isInstructor && (assignment.submissions?.length ?? 0) > 0 && (
          <button
            onClick={() => setShowSubmissionsList((p) => !p)}
            className="text-xs text-yellow-100 hover:underline"
          >
            {showSubmissionsList ? "Hide Submissions" : "View Submissions"}
          </button>
        )}
      </div>

      {/* INSTRUCTOR SUBMISSIONS LIST */}
      {isInstructor && showSubmissionsList && (
        <div className="mt-3 space-y-2 rounded-lg border border-richblack-700 bg-richblack-900 p-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-richblack-400">
            Student Submissions
          </p>
          {assignment.submissions.map((s, idx) => {
            const studentInfo = s.student;
            const studentName = typeof studentInfo === "object" && studentInfo !== null
              ? `${studentInfo.firstName} ${studentInfo.lastName}`
              : "Student";
            const studentEmail = typeof studentInfo === "object" && studentInfo !== null ? studentInfo.email : "";
            const studentImg = typeof studentInfo === "object" && studentInfo?.image
              ? studentInfo.image
              : `https://api.dicebear.com/5.x/initials/svg?seed=${studentName}`;

            return (
              <div key={idx} className="flex items-center justify-between rounded-md bg-richblack-800 p-2 text-xs">
                <div className="flex items-center gap-2">
                  <img src={studentImg} alt="student" className="h-6 w-6 rounded-full object-cover" />
                  <div>
                    <p className="font-medium text-richblack-5">{studentName}</p>
                    {studentEmail && <p className="text-[10px] text-richblack-400">{studentEmail}</p>}
                  </div>
                </div>
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => onPreview(s.submissionUrl, `${studentName} - ${assignment.title}`)}
                    className="font-medium text-blue-100 hover:underline cursor-pointer"
                  >
                    Open PDF / Submission →
                  </button>
                  <p className="text-[10px] text-richblack-400">
                    {new Date(s.submittedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* INSTRUCTOR EXTEND DEADLINE */}
      {isInstructor && (
        <div className="mt-3">
          {showExtend ? (
            <div className="flex gap-2">
              <input
                type="datetime-local"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="flex-1 rounded bg-richblack-700 px-2 py-1 text-sm text-richblack-5 outline-none"
              />
              <button
                onClick={() => {
                  dispatch(extendDeadline({ classroomId, assignmentId: assignment._id, newDueDate: newDate }, token));
                  setShowExtend(false);
                }}
                className="rounded bg-yellow-50 px-3 py-1 text-sm font-medium text-richblack-900"
              >
                Save
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowExtend(true)}
              className="text-xs text-blue-100 hover:underline"
            >
              Extend Deadline
            </button>
          )}
        </div>
      )}

      {/* STUDENT SUBMISSION SECTION */}
      {!isInstructor && (
        <div className="mt-3">
          {mySubmission ? (
            <div className="flex items-center justify-between rounded-lg border border-richblack-700 bg-richblack-900 px-3 py-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-richblack-300">Your Submission:</span>
                <button
                  type="button"
                  onClick={() => onPreview(mySubmission.submissionUrl, `${assignment.title} Submission`)}
                  className="text-blue-100 hover:underline cursor-pointer font-medium"
                >
                  View Submitted File / Link →
                </button>
              </div>
              {!isPast && (
                <button
                  type="button"
                  onClick={() => {
                    dispatch(deleteSubmission({ classroomId, assignmentId: assignment._id }, token));
                  }}
                  className="rounded bg-red-900/60 px-2 py-1 text-xs text-red-200 hover:bg-red-800 transition-all cursor-pointer"
                >
                  Unsubmit / Delete
                </button>
              )}
            </div>
          ) : isPast ? (
            <p className="text-xs text-red-300">Submission deadline has passed.</p>
          ) : showSubmit ? (
            <div className="mt-2 space-y-3 rounded-lg border border-richblack-700 bg-richblack-900 p-3">
              <div className="flex gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSubMode("file")}
                  className={`rounded px-3 py-1 transition-all ${
                    subMode === "file" ? "bg-yellow-50 text-richblack-900 font-semibold" : "bg-richblack-800 text-richblack-300 hover:text-richblack-5"
                  }`}
                >
                  Upload PDF File (Max 10 MB)
                </button>
                <button
                  type="button"
                  onClick={() => setSubMode("url")}
                  className={`rounded px-3 py-1 transition-all ${
                    subMode === "url" ? "bg-yellow-50 text-richblack-900 font-semibold" : "bg-richblack-800 text-richblack-300 hover:text-richblack-5"
                  }`}
                >
                  Submission PDF Link
                </button>
              </div>

              {subMode === "file" ? (
                <div className="space-y-1">
                  <label className="block text-xs text-richblack-300">Select PDF File (Limit: 10 MB):</label>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const isPdf = file.type === "application/pdf" || file.name?.toLowerCase().endsWith(".pdf");
                        if (!isPdf) {
                          toast.error("Only PDF files (.pdf) are allowed");
                          e.target.value = "";
                          setSubFile(null);
                          return;
                        }
                        if (file.size > 10 * 1024 * 1024) {
                          toast.error("File size must not exceed 10 MB");
                          e.target.value = "";
                          setSubFile(null);
                          return;
                        }
                      }
                      setSubFile(file);
                    }}
                    className="w-full text-xs text-richblack-300 file:mr-2 file:rounded file:border-0 file:bg-yellow-50 file:px-2 file:py-1 file:text-xs file:font-semibold file:text-richblack-900 hover:file:bg-yellow-25 cursor-pointer"
                  />
                </div>
              ) : (
                <input
                  type="url"
                  placeholder="https://example.com/submission.pdf"
                  value={subUrl}
                  onChange={(e) => setSubUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  className="w-full rounded bg-richblack-700 px-3 py-1.5 text-xs text-richblack-5 outline-none placeholder:text-richblack-400"
                />
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="rounded bg-yellow-50 px-3 py-1 text-xs font-semibold text-richblack-900 hover:bg-yellow-25"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSubmit(false);
                    setSubFile(null);
                    setSubUrl("");
                  }}
                  className="text-xs text-richblack-400 hover:text-richblack-5"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowSubmit(true)}
              className="flex items-center gap-1 text-xs font-medium text-yellow-100 hover:underline"
            >
              <MdUploadFile size={16} /> Submit Assignment (PDF or Link, Max 10 MB)
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ======================== MAIN ClassroomView ========================
function ClassroomView() {
  const { classroomId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const { currentClassroom, loading } = useSelector((state) => state.classroom);

  const isInstructor = user?.accountType === ACCOUNT_TYPE.INSTRUCTOR;

  const [activeTab, setActiveTab] = useState("feed");
  const [copied, setCopied] = useState(false);

  // Instructor forms
  const [noticeMsg, setNoticeMsg] = useState("");
  const [materialForm, setMaterialForm] = useState({ title: "", type: "link", contentUrl: "", textBody: "" });
  const [materialFile, setMaterialFile] = useState(null);
  const [assignmentForm, setAssignmentForm] = useState({ title: "", type: "text", description: "", dueDate: "" });
  const [assignmentFile, setAssignmentFile] = useState(null);
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [quizzesList, setQuizzesList] = useState([]);

  const loadQuizzes = async () => {
    if (classroomId && token) {
      const data = await fetchClassroomQuizzes(classroomId, token);
      setQuizzesList(data);
    }
  };

  useEffect(() => {
    if (classroomId) {
      dispatch(fetchClassroomDetails(classroomId, token));
      loadQuizzes();
    }
    return () => dispatch(clearClassroom());
  }, [classroomId]);

  const copyCode = () => {
    navigator.clipboard.writeText(currentClassroom?.uniqueCode || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(currentClassroom?.shareableUrl || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const [previewModal, setPreviewModal] = useState({ open: false, url: "", title: "" });

  const handlePreview = (url, title) => {
    setPreviewModal({ open: true, url, title });
  };

  if (loading || !currentClassroom) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-richblack-900">
        <div className="text-center text-richblack-300">
          <MdOutlineClass size={48} className="mx-auto mb-4 opacity-50" />
          <p>{loading ? "Loading classroom..." : "Classroom not found."}</p>
        </div>
      </div>
    );
  }

  const cls = currentClassroom;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-richblack-900 px-4 py-6 md:px-8">
      {/* Classroom Header */}
      <div className="mb-6 rounded-2xl border border-richblack-700 bg-richblack-800 p-6 shadow-lg">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-richblack-5">{cls.className}</h1>
            <p className="mt-1 text-sm text-richblack-300">{cls.description}</p>
            <p className="mt-1 text-xs text-richblack-400">
              Duration: {cls.duration} • {cls.studentsEnrolled?.length ?? 0} students
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-lg border border-richblack-600 bg-richblack-900 px-3 py-2">
              <span className="font-mono text-sm font-bold tracking-widest text-yellow-50">
                {cls.uniqueCode}
              </span>
              <button onClick={copyCode} className="text-richblack-300 hover:text-yellow-50">
                {copied ? <MdDone size={16} /> : <MdContentCopy size={16} />}
              </button>
            </div>
            <button
              onClick={copyUrl}
              className="rounded-lg border border-richblack-600 bg-richblack-900 px-3 py-2 text-xs text-richblack-300 hover:text-yellow-50 transition-all"
            >
              Copy Share URL
            </button>

            {!isInstructor && user?.accountType === ACCOUNT_TYPE.STUDENT && (
              <button
                onClick={() => dispatch(leaveClassroom(classroomId, token, navigate))}
                className="rounded-lg border border-red-900 bg-red-950/60 px-3 py-2 text-xs text-red-300 hover:bg-red-900 transition-all"
              >
                Leave Classroom
              </button>
            )}

            {user?.accountType === ACCOUNT_TYPE.ADMIN && (
              <button
                onClick={() => dispatch(deleteClassroom(classroomId, token, navigate))}
                className="rounded-lg bg-red-800 px-3 py-2 text-xs font-semibold text-red-100 hover:bg-red-700 transition-all"
              >
                Delete Classroom (Admin)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        <TabBtn label="📢 Feed" active={activeTab === "feed"} onClick={() => setActiveTab("feed")} />
        <TabBtn label="📚 Materials" active={activeTab === "materials"} onClick={() => setActiveTab("materials")} />
        <TabBtn label="📝 Assignments" active={activeTab === "assignments"} onClick={() => setActiveTab("assignments")} />
        <TabBtn label="📋 Quizzes" active={activeTab === "quizzes"} onClick={() => setActiveTab("quizzes")} />
        <TabBtn label="👥 Members" active={activeTab === "members"} onClick={() => setActiveTab("members")} />
      </div>

      {/* FEED TAB */}
      {activeTab === "feed" && (
        <div className="space-y-4">
          {/* Post notice (instructor) */}
          {isInstructor && (
            <div className="rounded-xl border border-richblack-700 bg-richblack-800 p-4">
              <p className="mb-2 text-sm font-medium text-richblack-200">Post Announcement</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={noticeMsg}
                  onChange={(e) => setNoticeMsg(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (!noticeMsg.trim()) return;
                      dispatch(postNotice({ classroomId, message: noticeMsg }, token));
                      setNoticeMsg("");
                    }
                  }}
                  placeholder="Write an announcement for your class (Press Enter to post)..."
                  className="flex-1 rounded-lg bg-richblack-700 px-3 py-2 text-sm text-richblack-5 outline-none placeholder:text-richblack-400"
                />
                <button
                  onClick={() => {
                    if (!noticeMsg.trim()) return;
                    dispatch(postNotice({ classroomId, message: noticeMsg }, token));
                    setNoticeMsg("");
                  }}
                  className="rounded-lg bg-yellow-50 px-4 py-2 text-sm font-medium text-richblack-900 hover:bg-yellow-25"
                >
                  Post
                </button>
              </div>
            </div>
          )}

          {/* Notices */}
          {[...cls.notices].reverse().map((n, i) => (
            <NoticeCard key={i} notice={n} />
          ))}
          {cls.notices.length === 0 && (
            <p className="py-6 text-center text-sm text-richblack-400">No announcements yet.</p>
          )}
        </div>
      )}

      {/* MATERIALS TAB */}
      {activeTab === "materials" && (
        <div className="space-y-4">
          {isInstructor && (
            <button
              onClick={() => setShowMaterialForm((p) => !p)}
              className="flex items-center gap-2 rounded-lg bg-yellow-50 px-4 py-2 text-sm font-medium text-richblack-900 hover:bg-yellow-25"
            >
              <MdAdd size={18} /> Add Material
            </button>
          )}

          {isInstructor && showMaterialForm && (
            <div className="rounded-xl border border-richblack-700 bg-richblack-800 p-4 space-y-3">
              <input
                type="text"
                placeholder="Title"
                value={materialForm.title}
                onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
                className="w-full rounded-lg bg-richblack-700 px-3 py-2 text-sm text-richblack-5 outline-none"
              />
              <select
                value={materialForm.type}
                onChange={(e) => setMaterialForm({ ...materialForm, type: e.target.value })}
                className="w-full rounded-lg bg-richblack-700 px-3 py-2 text-sm text-richblack-5 outline-none"
              >
                <option value="link">Link</option>
                <option value="pdf">PDF</option>
                <option value="image">Image</option>
                <option value="text">Text</option>
              </select>
              {materialForm.type === "text" ? (
                <textarea
                  placeholder="Text content"
                  value={materialForm.textBody}
                  onChange={(e) => setMaterialForm({ ...materialForm, textBody: e.target.value })}
                  className="w-full rounded-lg bg-richblack-700 px-3 py-2 text-sm text-richblack-5 outline-none"
                  rows={3}
                />
              ) : (
                <div className="space-y-2">
                  <input
                    type="url"
                    placeholder="URL (e.g. https://example.com)"
                    value={materialForm.contentUrl}
                    onChange={(e) => setMaterialForm({ ...materialForm, contentUrl: e.target.value })}
                    className="w-full rounded-lg bg-richblack-700 px-3 py-2 text-sm text-richblack-5 outline-none"
                  />
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
                    <span className="text-xs text-richblack-300">OR Upload File (PDF/Image, Limit 10 MB):</span>
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file && file.size > 10 * 1024 * 1024) {
                          toast.error("Material file size must not exceed 10 MB");
                          e.target.value = "";
                          setMaterialFile(null);
                          return;
                        }
                        setMaterialFile(file);
                      }}
                      className="text-xs text-richblack-300 file:mr-2 file:rounded file:border-0 file:bg-yellow-50 file:px-2 file:py-1 file:text-xs file:font-semibold file:text-richblack-900 hover:file:bg-yellow-25 cursor-pointer"
                      accept={materialForm.type === "pdf" ? ".pdf,application/pdf" : materialForm.type === "image" ? "image/*" : "*"}
                    />
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (!materialForm.title.trim()) {
                      toast.error("Title is required");
                      return;
                    }
                    if (materialForm.type !== "text" && !materialForm.contentUrl.trim() && !materialFile) {
                      toast.error("Please provide a URL or upload a file");
                      return;
                    }
                    if (materialForm.contentUrl.trim()) {
                      try {
                        const urlToTest = materialForm.contentUrl.trim().startsWith("http")
                          ? materialForm.contentUrl.trim()
                          : `https://${materialForm.contentUrl.trim()}`;
                        new URL(urlToTest);
                      } catch (err) {
                        toast.error("Please enter a valid URL (e.g. https://example.com)");
                        return;
                      }
                    }
                    if (materialFile && materialFile.size > 10 * 1024 * 1024) {
                      toast.error("Material file size must not exceed 10 MB");
                      return;
                    }
                    if (materialForm.type === "text" && !materialForm.textBody.trim()) {
                      toast.error("Text content is required");
                      return;
                    }

                    const formData = new FormData();
                    formData.append("classroomId", classroomId);
                    formData.append("title", materialForm.title);
                    formData.append("type", materialForm.type);
                    if (materialForm.type === "text") {
                      formData.append("textBody", materialForm.textBody);
                    } else {
                      if (materialForm.contentUrl.trim()) {
                        formData.append("contentUrl", materialForm.contentUrl);
                      }
                      if (materialFile) {
                        formData.append("materialFile", materialFile);
                      }
                    }

                    dispatch(postMaterial(formData, token));
                    setMaterialForm({ title: "", type: "link", contentUrl: "", textBody: "" });
                    setMaterialFile(null);
                    setShowMaterialForm(false);
                  }}
                  className="rounded-lg bg-yellow-50 px-4 py-2 text-sm font-medium text-richblack-900"
                >
                  Post
                </button>
                <button
                  onClick={() => {
                    setMaterialForm({ title: "", type: "link", contentUrl: "", textBody: "" });
                    setMaterialFile(null);
                    setShowMaterialForm(false);
                  }}
                  className="text-sm text-richblack-400 hover:text-richblack-5"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {[...cls.materials].reverse().map((m, i) => (
            <MaterialCard key={i} material={m} onPreview={handlePreview} />
          ))}
          {cls.materials.length === 0 && (
            <p className="py-6 text-center text-sm text-richblack-400">No materials posted yet.</p>
          )}
        </div>
      )}

      {/* ASSIGNMENTS TAB */}
      {activeTab === "assignments" && (
        <div className="space-y-4">
          {isInstructor && (
            <button
              onClick={() => setShowAssignmentForm((p) => !p)}
              className="flex items-center gap-2 rounded-lg bg-yellow-50 px-4 py-2 text-sm font-medium text-richblack-900 hover:bg-yellow-25"
            >
              <MdAdd size={18} /> Create Assignment
            </button>
          )}

          {isInstructor && showAssignmentForm && (
            <div className="rounded-xl border border-richblack-700 bg-richblack-800 p-4 space-y-3">
              <input
                type="text"
                placeholder="Assignment title"
                value={assignmentForm.title}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                className="w-full rounded-lg bg-richblack-700 px-3 py-2 text-sm text-richblack-5 outline-none"
              />

              <div className="space-y-1">
                <label className="block text-xs text-richblack-300">Assignment Type / Format</label>
                <select
                  value={assignmentForm.type}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, type: e.target.value })}
                  className="w-full rounded-lg bg-richblack-700 px-3 py-2 text-sm text-richblack-5 outline-none"
                >
                  <option value="text">Text (Type Instructions)</option>
                  <option value="pdf">PDF Document (Upload PDF File)</option>
                </select>
              </div>

              {assignmentForm.type === "pdf" ? (
                <div className="space-y-2">
                  <label className="block text-xs text-richblack-300">Upload Assignment PDF (Limit 10 MB):</label>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file && file.size > 10 * 1024 * 1024) {
                        toast.error("Assignment PDF file size must not exceed 10 MB");
                        e.target.value = "";
                        setAssignmentFile(null);
                        return;
                      }
                      setAssignmentFile(file);
                    }}
                    className="w-full text-xs text-richblack-300 file:mr-2 file:rounded file:border-0 file:bg-yellow-50 file:px-2 file:py-1 file:text-xs file:font-semibold file:text-richblack-900 hover:file:bg-yellow-25 cursor-pointer"
                  />
                  <textarea
                    placeholder="Additional Description / Notes (optional)"
                    value={assignmentForm.description}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                    className="w-full rounded-lg bg-richblack-700 px-3 py-2 text-sm text-richblack-5 outline-none"
                    rows={2}
                  />
                </div>
              ) : (
                <textarea
                  placeholder="Assignment Instructions / Text Body *"
                  value={assignmentForm.description}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                  className="w-full rounded-lg bg-richblack-700 px-3 py-2 text-sm text-richblack-5 outline-none"
                  rows={3}
                />
              )}

              <div>
                <label className="mb-1 block text-xs text-richblack-300">Due Date & Time *</label>
                <input
                  type="datetime-local"
                  value={assignmentForm.dueDate}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })}
                  className="w-full rounded-lg bg-richblack-700 px-3 py-2 text-sm text-richblack-5 outline-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (!assignmentForm.title.trim()) {
                      toast.error("Assignment title is required");
                      return;
                    }
                    if (!assignmentForm.dueDate) {
                      toast.error("Due date & time is required");
                      return;
                    }
                    if (assignmentForm.type === "pdf" && !assignmentFile) {
                      toast.error("Please upload an assignment PDF file");
                      return;
                    }
                    if (assignmentForm.type === "text" && !assignmentForm.description.trim()) {
                      toast.error("Assignment text instructions are required");
                      return;
                    }

                    const formData = new FormData();
                    formData.append("classroomId", classroomId);
                    formData.append("title", assignmentForm.title);
                    formData.append("description", assignmentForm.description);
                    formData.append("dueDate", assignmentForm.dueDate);
                    if (assignmentForm.type === "pdf" && assignmentFile) {
                      formData.append("assignmentFile", assignmentFile);
                    }

                    dispatch(createAssignment(formData, token));
                    setAssignmentForm({ title: "", type: "text", description: "", dueDate: "" });
                    setAssignmentFile(null);
                    setShowAssignmentForm(false);
                  }}
                  className="rounded-lg bg-yellow-50 px-4 py-2 text-sm font-medium text-richblack-900 hover:bg-yellow-25"
                >
                  Create Assignment
                </button>
                <button
                  onClick={() => {
                    setAssignmentForm({ title: "", type: "text", description: "", dueDate: "" });
                    setAssignmentFile(null);
                    setShowAssignmentForm(false);
                  }}
                  className="text-sm text-richblack-400 hover:text-richblack-5"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {[...cls.assignments].reverse().map((a, i) => (
            <AssignmentCard
              key={i}
              assignment={a}
              isInstructor={isInstructor}
              classroomId={classroomId}
              token={token}
              dispatch={dispatch}
              userId={user?._id}
              onPreview={handlePreview}
            />
          ))}
          {cls.assignments.length === 0 && (
            <p className="py-6 text-center text-sm text-richblack-400">No assignments yet.</p>
          )}
        </div>
      )}

      {/* MEMBERS TAB */}
      {activeTab === "members" && (
        <div className="space-y-3">
          {/* Instructor */}
          <div className="rounded-xl border border-richblack-700 bg-richblack-800 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-richblack-400">
              Instructor
            </p>
            {cls.instructor && (
              <div className="flex items-center gap-3">
                <img
                  src={cls.instructor.image || `https://api.dicebear.com/5.x/initials/svg?seed=${cls.instructor.firstName}`}
                  alt="instructor"
                  className="h-9 w-9 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-medium text-richblack-5">
                    {cls.instructor.firstName} {cls.instructor.lastName}
                  </p>
                  <p className="text-xs text-richblack-400">{cls.instructor.email}</p>
                </div>
              </div>
            )}
          </div>

          {/* Students */}
          <div className="rounded-xl border border-richblack-700 bg-richblack-800 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-richblack-400">
              Students ({cls.studentsEnrolled?.length ?? 0})
            </p>
            {cls.studentsEnrolled?.length === 0 ? (
              <p className="text-sm text-richblack-400">No students enrolled yet.</p>
            ) : (
              <div className="space-y-2">
                {cls.studentsEnrolled.map((s, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <img
                      src={s?.image || `https://api.dicebear.com/5.x/initials/svg?seed=${s?.firstName || "S"}`}
                      alt="student"
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    <p className="text-sm text-richblack-5">
                      {s?.firstName} {s?.lastName}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* QUIZZES TAB */}
      {activeTab === "quizzes" && (
        <ClassroomQuizzes
          quizzes={quizzesList}
          isInstructor={isInstructor}
          classroomId={classroomId}
          token={token}
          onQuizAdded={loadQuizzes}
        />
      )}

      {/* FILE PREVIEW MODAL */}
      {previewModal.open && (
        <FilePreviewModal
          url={previewModal.url}
          title={previewModal.title}
          onClose={() => setPreviewModal({ open: false, url: "", title: "" })}
        />
      )}
    </div>
  );
}

export default ClassroomView;
