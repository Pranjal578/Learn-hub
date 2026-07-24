import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchMyClassrooms, leaveClassroom } from "../../../../services/operations/classroomAPI";
import { MdOutlineClass, MdOpenInNew, MdPeople, MdCalendarToday, MdAdd, MdExitToApp } from "react-icons/md";
import JoinClassroomModal from "./JoinClassroomModal";

function EnrolledClassrooms() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const { classrooms, loading } = useSelector((state) => state.classroom);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [confirmLeaveId, setConfirmLeaveId] = useState(null);

  useEffect(() => {
    dispatch(fetchMyClassrooms(token));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLeave = (classroomId) => {
    dispatch(leaveClassroom(classroomId, token, navigate));
    setConfirmLeaveId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-richblack-300">Loading your classrooms...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-richblack-5">Joined Classrooms</h1>
          <p className="mt-1 text-sm text-richblack-300">
            All classrooms you are currently enrolled in
          </p>
        </div>
        <button
          onClick={() => setShowJoinModal(true)}
          className="flex items-center gap-2 rounded-lg bg-yellow-50 px-4 py-2 text-sm font-medium text-richblack-900 hover:bg-yellow-25 transition-all"
        >
          <MdAdd size={18} /> Join with Code
        </button>
      </div>

      {classrooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-richblack-600 py-20 text-center">
          <MdOutlineClass size={48} className="mb-3 text-richblack-500" />
          <p className="text-richblack-400">You haven't joined any classrooms yet.</p>
          <button
            onClick={() => setShowJoinModal(true)}
            className="mt-4 flex items-center gap-2 rounded-lg bg-yellow-50 px-4 py-2 text-sm font-medium text-richblack-900"
          >
            <MdAdd size={16} /> Join a Classroom
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {classrooms.map((cls) => (
            <div
              key={cls._id}
              className="flex flex-col rounded-2xl border border-richblack-700 bg-richblack-800 p-5 shadow-md transition-all hover:border-richblack-500"
            >
              {/* Instructor avatar + name */}
              {cls.instructor && (
                <div className="mb-3 flex items-center gap-2">
                  <img
                    src={
                      cls.instructor.image ||
                      `https://api.dicebear.com/5.x/initials/svg?seed=${cls.instructor.firstName}`
                    }
                    alt="instructor"
                    className="h-7 w-7 rounded-full object-cover"
                  />
                  <span className="text-xs text-richblack-400">
                    {cls.instructor.firstName} {cls.instructor.lastName}
                  </span>
                </div>
              )}

              <h2 className="mb-1 text-lg font-semibold text-richblack-5">{cls.className}</h2>
              <p className="mb-3 text-sm text-richblack-300 line-clamp-2">{cls.description}</p>

              <div className="mb-4 flex flex-wrap gap-3 text-xs text-richblack-400">
                <span className="flex items-center gap-1">
                  <MdPeople size={14} /> {cls.studentsEnrolled?.length ?? 0} enrolled
                </span>
                <span className="flex items-center gap-1">
                  <MdCalendarToday size={14} /> {cls.duration}
                </span>
              </div>

              {/* Progress indicator */}
              <div className="mb-4 text-xs text-richblack-400">
                <span>{cls.assignments?.length ?? 0} assignments</span>
                {" · "}
                <span>{cls.materials?.length ?? 0} materials</span>
                {" · "}
                <span>{cls.notices?.length ?? 0} notices</span>
              </div>

              <div className="mt-auto flex gap-2">
                <button
                  onClick={() => navigate(`/classroom/${cls._id}`)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-richblack-700 py-2 text-sm text-richblack-5 hover:bg-richblack-600 transition-all"
                >
                  <MdOpenInNew size={16} /> Enter
                </button>
                {confirmLeaveId === cls._id ? (
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleLeave(cls._id)}
                      className="rounded-lg bg-red-800 px-3 py-2 text-xs font-semibold text-red-100 hover:bg-red-700"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setConfirmLeaveId(null)}
                      className="rounded-lg bg-richblack-700 px-2 py-2 text-xs text-richblack-300 hover:text-richblack-5"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmLeaveId(cls._id)}
                    className="flex items-center gap-1 rounded-lg border border-red-900 bg-red-950/40 px-3 py-2 text-xs text-red-300 hover:bg-red-900/60 transition-all"
                    title="Leave Classroom"
                  >
                    <MdExitToApp size={16} /> Leave
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Join Modal */}
      {showJoinModal && (
        <JoinClassroomModal onClose={() => setShowJoinModal(false)} />
      )}
    </div>
  );
}

export default EnrolledClassrooms;
