import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { joinClassroom } from "../../../../services/operations/classroomAPI";
import { MdClose, MdOutlineClass } from "react-icons/md";

function JoinClassroomModal({ onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const { loading } = useSelector((state) => state.classroom);

  const [code, setCode] = useState("");

  const handleJoin = (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    dispatch(joinClassroom(code.trim().toUpperCase(), token, navigate));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-richblack-700 bg-richblack-800 p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MdOutlineClass size={22} className="text-yellow-50" />
            <h2 className="text-lg font-semibold text-richblack-5">Join a Classroom</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-richblack-400 hover:bg-richblack-700 hover:text-richblack-5 transition-all"
          >
            <MdClose size={20} />
          </button>
        </div>

        <p className="mb-4 text-sm text-richblack-300">
          Enter the unique class code shared by your instructor to join their classroom.
        </p>

        <form onSubmit={handleJoin}>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter code e.g. A1B2C3D4"
            maxLength={8}
            style={{ boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)" }}
            className="mb-4 w-full rounded-lg bg-richblack-700 p-3 text-center font-mono text-lg font-bold tracking-[0.3em] text-yellow-50 outline-none placeholder:font-normal placeholder:tracking-normal placeholder:text-richblack-400"
          />

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="flex-1 rounded-lg bg-yellow-50 py-2.5 text-sm font-semibold text-richblack-900 hover:bg-yellow-25 transition-all disabled:opacity-60"
            >
              {loading ? "Joining..." : "Join Classroom"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-richblack-600 py-2.5 text-sm text-richblack-300 hover:bg-richblack-700 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default JoinClassroomModal;
