import { toast } from "react-hot-toast"

import { setLoading, setUser } from "../../slices/profileSlice"
import { apiConnector } from "../apiConnector"
import { profileEndpoints } from "../apis"
import { logout } from "./authAPI"

const { GET_USER_DETAILS_API, GET_USER_ENROLLED_COURSES_API, UNENROLL_COURSE_API, GET_INSTRUCTOR_DATA_API } = profileEndpoints


// ================ get User Details  ================
export function getUserDetails(token, navigate) {
  return async (dispatch) => {
    const toastId = toast.loading("Loading...")
    dispatch(setLoading(true))
    try {
      const response = await apiConnector("GET", GET_USER_DETAILS_API, null, { Authorization: `Bearer ${token}`, })
      console.log("GET_USER_DETAILS API RESPONSE............", response)

      if (!response?.data?.success || !response?.data?.data) {
        throw new Error(response?.data?.message || "User data not found")
      }
      const userImage = response.data.data.image
        ? response.data.data.image
        : `https://api.dicebear.com/5.x/initials/svg?seed=${response.data.data.firstName} ${response.data.data.lastName}`
      dispatch(setUser({ ...response.data.data, image: userImage }))
    } catch (error) {
      console.log("GET_USER_DETAILS API ERROR............", error)
    } finally {
      toast.dismiss(toastId)
      dispatch(setLoading(false))
    }
  }
}

// ================ get User Enrolled Courses  ================
export async function getUserEnrolledCourses(token) {
  // const toastId = toast.loading("Loading...")
  let result = []
  try {
    const response = await apiConnector("GET", GET_USER_ENROLLED_COURSES_API, {token}, { Authorization: `Bearer ${token}`, })

    console.log("GET_USER_ENROLLED_COURSES_API API RESPONSE............", response)

    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    result = response.data.data
  } catch (error) {
    console.log("GET_USER_ENROLLED_COURSES_API API ERROR............", error)
    toast.error("Could Not Get Enrolled Courses")
  }
  // toast.dismiss(toastId)
  return result
}

// ================ get Instructor Data  ================
export async function getInstructorData(token) {
  // const toastId = toast.loading("Loading...")
  let result = []
  try {
    const response = await apiConnector("GET", GET_INSTRUCTOR_DATA_API, null, {
      Authorization: `Bearer ${token}`,
    })
    console.log("GET_INSTRUCTOR_DATA_API API RESPONSE............", response)
    result = response?.data?.courses
  } catch (error) {
    console.log("GET_INSTRUCTOR_DATA_API API ERROR............", error)
    toast.error("Could Not Get Instructor Data")
  }
  // toast.dismiss(toastId)
  return result
}


// ================ Unenroll Course (Student) ================
export async function unenrollCourse(courseId, token) {
  const toastId = toast.loading("Unenrolling from course...");
  try {
    const response = await apiConnector(
      "POST",
      UNENROLL_COURSE_API,
      { courseId },
      { Authorization: `Bearer ${token}` }
    );
    if (!response.data.success) throw new Error(response.data.message);
    toast.success("Unenrolled from course successfully");
    return true;
  } catch (error) {
    console.error("UNENROLL COURSE ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to unenroll from course");
    return false;
  } finally {
    toast.dismiss(toastId);
  }
}
