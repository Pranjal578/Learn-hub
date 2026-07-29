import { toast } from "react-hot-toast";
import { apiConnector } from "../apiconnector";
import { quizEndpoints } from "../apis";

const { 
  CREATE_QUIZ_API, 
  SUBMIT_QUIZ_API, 
  GET_CLASSROOM_QUIZZES_API, 
  GET_QUIZ_BY_SUBSECTION_API, 
  GET_QUIZ_BY_ID_API 
} = quizEndpoints;

export const createQuiz = async (data, token) => {
  const toastId = toast.loading("Publishing quiz...");
  let result = null;
  try {
    const response = await apiConnector("POST", CREATE_QUIZ_API, data, {
      Authorization: `Bearer ${token}`,
    });

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could not create quiz");
    }

    toast.success("Quiz published live successfully!");
    result = response?.data?.data;
  } catch (error) {
    console.error("CREATE_QUIZ_API ERROR:", error);
    toast.error(error?.response?.data?.message || error.message || "Failed to create quiz");
  }
  toast.dismiss(toastId);
  return result;
};

export const submitQuiz = async (data, token) => {
  const toastId = toast.loading("Submitting quiz responses...");
  let result = null;
  try {
    const response = await apiConnector("POST", SUBMIT_QUIZ_API, data, {
      Authorization: `Bearer ${token}`,
    });

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could not submit quiz");
    }

    toast.success("Quiz submitted successfully!");
    result = response?.data;
  } catch (error) {
    console.error("SUBMIT_QUIZ_API ERROR:", error);
    toast.error(error?.response?.data?.message || error.message || "Failed to submit quiz");
  }
  toast.dismiss(toastId);
  return result;
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

export const fetchQuizById = async (quizId, token) => {
  try {
    const response = await apiConnector(
      "GET",
      `${GET_QUIZ_BY_ID_API}/${quizId}`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could not fetch quiz details");
    }

    return response?.data?.data || null;
  } catch (error) {
    console.error("FETCH_QUIZ_BY_ID_API ERROR:", error);
    return null;
  }
};

export const fetchQuizBySubSection = async (subSectionId, token) => {
  try {
    const response = await apiConnector(
      "GET",
      `${GET_QUIZ_BY_SUBSECTION_API}/${subSectionId}`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could not fetch quiz for subsection");
    }

    return response?.data?.data || null;
  } catch (error) {
    console.error("FETCH_QUIZ_BY_SUBSECTION_API ERROR:", error);
    return null;
  }
};
