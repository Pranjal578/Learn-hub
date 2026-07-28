import { toast } from "react-hot-toast";
import { apiConnector } from "../apiconnector";
import { quizEndpoints } from "../apis";

const { ADD_QUIZ_API, GET_CLASSROOM_QUIZZES_API } = quizEndpoints;

export const addQuizToClassroom = async (data, token) => {
  const toastId = toast.loading("Adding quiz...");
  let success = false;
  try {
    const response = await apiConnector("POST", ADD_QUIZ_API, data, {
      Authorization: `Bearer ${token}`,
    });

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could not add quiz");
    }

    toast.success("Quiz added successfully");
    success = true;
  } catch (error) {
    console.error("ADD_QUIZ_API ERROR:", error);
    toast.error(error?.response?.data?.message || error.message || "Failed to add quiz");
  }
  toast.dismiss(toastId);
  return success;
};

export const fetchClassroomQuizzes = async (classroomId, token) => {
  try {
    const response = await apiConnector(
      "GET",
      `${GET_CLASSROOM_QUIZZES_API}/${classroomId}`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could not fetch quizzes");
    }

    return response?.data?.data || [];
  } catch (error) {
    console.error("FETCH_CLASSROOM_QUIZZES_API ERROR:", error);
    return [];
  }
};
