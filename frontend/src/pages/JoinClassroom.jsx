import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { joinClassroom } from "../services/operations/classroomAPI";
import { MdOutlineClass } from "react-icons/md";

function JoinClassroom() {
  const { uniqueCode } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const { loading } = useSelector((state) => state.classroom);

  const [joined, setJoined] = useState(false);

  useEffect(() => {
    // Only students can join via URL
    if (token && uniqueCode && user?.accountType === "Student") {
      handleJoin(uniqueCode);
    } else if (!token) {
      // Redirect to login, preserve the return URL
      navigate(`/login?redirect=/join/${uniqueCode}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, uniqueCode]);

  const handleJoin = async (code) => {
    await dispatch(joinClassroom(code, token, navigate));
    setJoined(true);
  };

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-richblack-900">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-richblack-800 border border-richblack-700">
          <MdOutlineClass size={36} className="text-yellow-50" />
        </div>
        {loading ? (
          <p className="text-richblack-300">Joining classroom...</p>
        ) : joined ? (
          <p className="text-richblack-300">Redirecting to classroom...</p>
        ) : (
          <p className="text-richblack-300">Processing join request for code: <span className="font-mono text-yellow-50">{uniqueCode}</span></p>
        )}
      </div>
    </div>
  );
}

export default JoinClassroom;
