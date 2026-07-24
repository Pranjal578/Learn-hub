import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchMyClassrooms, deleteClassroom } from "../../../../services/operations/classroomAPI";
import {
  MdOutlineClass,
  MdAdd,
  MdDelete,
  MdOpenInNew,
  MdContentCopy,
  MdDone,
  MdPeople,
  MdCalendarToday,
} from "react-icons/md";

function MyClassrooms() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const { classrooms, loading } = useSelector((state) => state.classroom);
  const [copiedId, setCopiedId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    dispatch(fetchMyClassrooms(token));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (classroomId) => {
    dispatch(deleteClassroom(classroomId, token, navigate));
    setConfirmDelete(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-richblack-300">Loading classrooms...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-richblack-5">My Classrooms</h1>
          <p className="mt-1 text-sm text-richblack-300">
            Manage all your created classrooms
          </p>
        </div>
        <button
          onClick={() => navigate("/dashboard/create-classroom")}
          className="flex items-center gap-2 rounded-lg bg-yellow-50 px-4 py-2 text-sm font-medium text-richblack-900 hover:bg-yellow-25 transition-all"
        >
          <MdAdd size={18} /> New Classroom
        </button>
      </div>

      {classrooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-richblack-600 py-20 text-center">
          <MdOutlineClass size={48} className="mb-3 text-richblack-500" />
          <p className="text-richblack-400">You haven't created any classrooms yet.</p>
          <button
            onClick={() => navigate("/dashboard/create-classroom")}
            className="mt-4 flex items-center gap-2 rounded-lg bg-yellow-50 px-4 py-2 text-sm font-medium text-richblack-900"
          >
            <MdAdd size={16} /> Create Your First Classroom
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {classrooms.map((cls) => (
            <div
              key={cls._id}
              className="group relative flex flex-col rounded-2xl border border-richblack-700 bg-richblack-800 p-5 shadow-md transition-all hover:border-richblack-500"
            >
              {/* Title */}
              <h2 className="mb-1 text-lg font-semibold text-richblack-5">
                {cls.className}
              </h2>
              <p className="mb-3 text-sm text-richblack-300 line-clamp-2">{cls.description}</p>

              {/* Meta */}
              <div className="mb-4 flex flex-wrap gap-3 text-xs text-richblack-400">
                <span className="flex items-center gap-1">
                  <MdPeople size={14} /> {cls.studentsEnrolled?.length ?? 0} students
                </span>
                <span className="flex items-center gap-1">
                  <MdCalendarToday size={14} /> {cls.duration}
                </span>
              </div>

              {/* Code */}
              <div className="mb-4 flex items-center justify-between rounded-lg border border-richblack-600 bg-richblack-900 px-3 py-2">
                <span className="font-mono text-sm font-bold tracking-widest text-yellow-50">
                  {cls.uniqueCode}
                </span>
                <button
                  onClick={() => handleCopy(cls.uniqueCode, cls._id + "code")}
                  className="text-richblack-400 hover:text-yellow-50 transition-colors"
                  title="Copy code"
                >
                  {copiedId === cls._id + "code" ? (
                    <MdDone size={16} className="text-green-400" />
                  ) : (
                    <MdContentCopy size={16} />
                  )}
                </button>
              </div>

              {/* Actions */}
              <div className="mt-auto flex gap-2">
                <button
                  onClick={() => navigate(`/classroom/${cls._id}`)}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-richblack-700 py-2 text-sm text-richblack-5 hover:bg-richblack-600 transition-all"
                >
                  <MdOpenInNew size={16} /> Open
                </button>
                <button
                  onClick={() => handleCopy(cls.shareableUrl, cls._id + "url")}
                  className="rounded-lg border border-richblack-600 px-3 py-2 text-xs text-richblack-300 hover:text-yellow-50 hover:border-yellow-50 transition-all"
                  title="Copy share URL"
                >
                  {copiedId === cls._id + "url" ? <MdDone size={16} className="text-green-400" /> : "Share"}
                </button>
                <button
                  onClick={() => setConfirmDelete(cls._id)}
                  className="rounded-lg border border-richblack-600 px-3 py-2 text-richblack-300 hover:border-red-500 hover:text-red-400 transition-all"
                  title="Delete classroom"
                >
                  <MdDelete size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-richblack-700 bg-richblack-800 p-6 shadow-2xl">
            <h3 className="mb-2 text-lg font-semibold text-richblack-5">Delete Classroom?</h3>
            <p className="mb-5 text-sm text-richblack-300">
              This action cannot be undone. All materials, assignments, and enrollments will be removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 rounded-lg border border-richblack-600 py-2 text-sm text-richblack-300 hover:bg-richblack-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyClassrooms;
