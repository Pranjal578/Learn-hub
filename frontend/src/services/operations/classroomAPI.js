import { toast } from "react-hot-toast";
import { apiConnector } from "../apiConnector";
import { classroomEndpoints } from "../apis";
import { setClassrooms, setCurrentClassroom, setLoading } from "../../slices/classroomSlice";

const {
  CREATE_CLASSROOM_API,
  JOIN_CLASSROOM_API,
  LEAVE_CLASSROOM_API,
  GET_CLASSROOM_DETAILS_API,
  GET_MY_CLASSROOMS_API,
  POST_MATERIAL_API,
  POST_NOTICE_API,
  CREATE_ASSIGNMENT_API,
  EXTEND_DEADLINE_API,
  SUBMIT_ASSIGNMENT_API,
  DELETE_SUBMISSION_API,
  DELETE_CLASSROOM_API,
  GET_ALL_CLASSROOMS_PUBLIC_API,
} = classroomEndpoints;

// ================ Delete Submission (Student) ================
export function deleteSubmission(data, token) {
  return async (dispatch) => {
    const toastId = toast.loading("Deleting submission...");
    try {
      const response = await apiConnector("POST", DELETE_SUBMISSION_API, data, {
        Authorization: `Bearer ${token}`,
      });
      if (!response.data.success) throw new Error(response.data.message);
      toast.success("Submission deleted!");
      if (data?.classroomId) {
        dispatch(fetchClassroomDetails(data.classroomId, token));
      }
    } catch (error) {
      console.error("DELETE SUBMISSION ERROR:", error);
      toast.error(error?.response?.data?.message || "Failed to delete submission");
    } finally {
      toast.dismiss(toastId);
    }
  };
}

// ================ Leave Classroom (Student) ================
export function leaveClassroom(classroomId, token, navigate) {
  return async (dispatch) => {
    const toastId = toast.loading("Leaving classroom...");
    dispatch(setLoading(true));
    try {
      const response = await apiConnector(
        "POST",
        LEAVE_CLASSROOM_API,
        { classroomId },
        { Authorization: `Bearer ${token}` }
      );
      if (!response.data.success) throw new Error(response.data.message);
      toast.success("Left classroom successfully");
      dispatch(fetchMyClassrooms(token));
      if (navigate) navigate("/dashboard/joined-classrooms");
      return response.data;
    } catch (error) {
      console.error("LEAVE CLASSROOM ERROR:", error);
      toast.error(error?.response?.data?.message || "Failed to leave classroom");
    } finally {
      dispatch(setLoading(false));
      toast.dismiss(toastId);
    }
  };
}


// ================ Create Classroom (Instructor) ================
export function createClassroom(formData, token, navigate) {
  return async (dispatch) => {
    const toastId = toast.loading("Creating classroom...");
    dispatch(setLoading(true));
    try {
      const response = await apiConnector("POST", CREATE_CLASSROOM_API, formData, {
        Authorization: `Bearer ${token}`,
      });
      if (!response.data.success) throw new Error(response.data.message);
      toast.success("Classroom created!");
      dispatch(fetchMyClassrooms(token));
      if (navigate) navigate("/dashboard/my-classrooms");
      return response.data.data;
    } catch (error) {
      console.error("CREATE CLASSROOM ERROR:", error);
      toast.error(error?.response?.data?.message || "Failed to create classroom");
    } finally {
      dispatch(setLoading(false));
      toast.dismiss(toastId);
    }
  };
}


// ================ Join Classroom by Code (Student) ================
export function joinClassroom(uniqueCode, token, navigate) {
  return async (dispatch) => {
    const toastId = toast.loading("Joining classroom...");
    dispatch(setLoading(true));
    try {
      const response = await apiConnector(
        "POST",
        JOIN_CLASSROOM_API,
        { uniqueCode },
        { Authorization: `Bearer ${token}` }
      );
      if (!response.data.success) throw new Error(response.data.message);
      toast.success("Successfully joined classroom!");
      dispatch(fetchMyClassrooms(token));
      if (navigate) navigate(`/classroom/${response.data.data._id}`);
      return response.data.data;
    } catch (error) {
      console.error("JOIN CLASSROOM ERROR:", error);
      toast.error(error?.response?.data?.message || "Failed to join classroom");
    } finally {
      dispatch(setLoading(false));
      toast.dismiss(toastId);
    }
  };
}


// ================ Fetch My Classrooms (Instructor / Student) ================
export function fetchMyClassrooms(token) {
  return async (dispatch) => {
    dispatch(setLoading(true));
    try {
      const response = await apiConnector("GET", GET_MY_CLASSROOMS_API, null, {
        Authorization: `Bearer ${token}`,
      });
      if (!response.data.success) throw new Error(response.data.message);
      dispatch(setClassrooms(response.data.data));
    } catch (error) {
      console.error("FETCH CLASSROOMS ERROR:", error);
      toast.error(error?.response?.data?.message || "Failed to fetch classrooms");
    } finally {
      dispatch(setLoading(false));
    }
  };
}


// ================ Fetch Single Classroom Details ================
export function fetchClassroomDetails(classroomId, token) {
  return async (dispatch) => {
    dispatch(setLoading(true));
    try {
      const response = await apiConnector(
        "POST",
        GET_CLASSROOM_DETAILS_API,
        { classroomId },
        { Authorization: `Bearer ${token}` }
      );
      if (!response.data.success) throw new Error(response.data.message);
      dispatch(setCurrentClassroom(response.data.data));
    } catch (error) {
      console.error("FETCH CLASSROOM DETAILS ERROR:", error);
      toast.error(error?.response?.data?.message || "Failed to fetch classroom details");
    } finally {
      dispatch(setLoading(false));
    }
  };
}


// ================ Post Material (Instructor) ================
export function postMaterial(data, token) {
  return async (dispatch) => {
    const toastId = toast.loading("Posting material...");
    try {
      const response = await apiConnector("POST", POST_MATERIAL_API, data, {
        Authorization: `Bearer ${token}`,
      });
      if (!response.data.success) throw new Error(response.data.message);
      toast.success("Material posted!");
      
      const classroomId = data instanceof FormData ? data.get("classroomId") : data.classroomId;
      dispatch(fetchClassroomDetails(classroomId, token));
    } catch (error) {
      console.error("POST MATERIAL ERROR:", error);
      toast.error(error?.response?.data?.message || "Failed to post material");
    } finally {
      toast.dismiss(toastId);
    }
  };
}


// ================ Post Notice (Instructor) ================
export function postNotice(data, token) {
  return async (dispatch) => {
    const toastId = toast.loading("Posting notice...");
    try {
      const response = await apiConnector("POST", POST_NOTICE_API, data, {
        Authorization: `Bearer ${token}`,
      });
      if (!response.data.success) throw new Error(response.data.message);
      toast.success("Notice posted!");
      dispatch(fetchClassroomDetails(data.classroomId, token));
    } catch (error) {
      console.error("POST NOTICE ERROR:", error);
      toast.error(error?.response?.data?.message || "Failed to post notice");
    } finally {
      toast.dismiss(toastId);
    }
  };
}


// ================ Create Assignment (Instructor) ================
export function createAssignment(data, token) {
  return async (dispatch) => {
    const toastId = toast.loading("Creating assignment...");
    try {
      const response = await apiConnector("POST", CREATE_ASSIGNMENT_API, data, {
        Authorization: `Bearer ${token}`,
      });
      if (!response.data.success) throw new Error(response.data.message);
      toast.success("Assignment created!");
      dispatch(fetchClassroomDetails(data.classroomId, token));
    } catch (error) {
      console.error("CREATE ASSIGNMENT ERROR:", error);
      toast.error(error?.response?.data?.message || "Failed to create assignment");
    } finally {
      toast.dismiss(toastId);
    }
  };
}


// ================ Extend Deadline (Instructor) ================
export function extendDeadline(data, token) {
  return async (dispatch) => {
    const toastId = toast.loading("Extending deadline...");
    try {
      const response = await apiConnector("POST", EXTEND_DEADLINE_API, data, {
        Authorization: `Bearer ${token}`,
      });
      if (!response.data.success) throw new Error(response.data.message);
      toast.success("Deadline extended!");
      dispatch(fetchClassroomDetails(data.classroomId, token));
    } catch (error) {
      console.error("EXTEND DEADLINE ERROR:", error);
      toast.error(error?.response?.data?.message || "Failed to extend deadline");
    } finally {
      toast.dismiss(toastId);
    }
  };
}


// ================ Submit Assignment (Student) ================
export function submitAssignment(data, token) {
  return async (dispatch) => {
    const toastId = toast.loading("Submitting assignment...");
    try {
      const response = await apiConnector("POST", SUBMIT_ASSIGNMENT_API, data, {
        Authorization: `Bearer ${token}`,
      });
      if (!response.data.success) throw new Error(response.data.message);
      toast.success("Assignment submitted!");
      const classroomId = data instanceof FormData ? data.get("classroomId") : data.classroomId;
      if (classroomId) {
        dispatch(fetchClassroomDetails(classroomId, token));
      }
    } catch (error) {
      console.error("SUBMIT ASSIGNMENT ERROR:", error);
      toast.error(error?.response?.data?.message || "Failed to submit assignment");
    } finally {
      toast.dismiss(toastId);
    }
  };
}


// ================ Delete Classroom (Instructor) ================
export function deleteClassroom(classroomId, token, navigate) {
  return async (dispatch) => {
    const toastId = toast.loading("Deleting classroom...");
    try {
      const response = await apiConnector(
        "DELETE",
        DELETE_CLASSROOM_API,
        { classroomId },
        { Authorization: `Bearer ${token}` }
      );
      if (!response.data.success) throw new Error(response.data.message);
      toast.success("Classroom deleted!");
      dispatch(fetchMyClassrooms(token));
      if (navigate) navigate("/dashboard/my-classrooms");
    } catch (error) {
      console.error("DELETE CLASSROOM ERROR:", error);
      toast.error(error?.response?.data?.message || "Failed to delete classroom");
    } finally {
      toast.dismiss(toastId);
    }
  };
}


// ================ Fetch All Classrooms Public (For Catalog) ================
export function fetchAllClassroomsPublic(token) {
  return async (dispatch) => {
    dispatch(setLoading(true));
    try {
      const response = await apiConnector(
        "GET",
        GET_ALL_CLASSROOMS_PUBLIC_API,
        null,
        { Authorization: `Bearer ${token}` }
      );
      if (!response.data.success) throw new Error(response.data.message);
      dispatch(setClassrooms(response.data.data));
    } catch (error) {
      console.error("FETCH ALL CLASSROOMS PUBLIC ERROR:", error);
      toast.error(error?.response?.data?.message || "Failed to fetch classrooms");
    } finally {
      dispatch(setLoading(false));
    }
  };
}
