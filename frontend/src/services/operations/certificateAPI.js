import { toast } from "react-hot-toast";
import { apiConnector } from "../apiconnector";
import { certificateEndpoints } from "../apis";

const {
  GENERATE_CERTIFICATE_API,
  GENERATE_COURSE_CERTIFICATE_API,
  VERIFY_CERTIFICATE_API,
} = certificateEndpoints;

// ---- Classroom Certificate ----
export const generateCertificate = async (classroomId, token) => {
  const toastId = toast.loading("Generating Certificate...");
  let certData = null;
  try {
    const response = await apiConnector(
      "POST",
      GENERATE_CERTIFICATE_API,
      { classroomId },
      { Authorization: `Bearer ${token}` }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could not generate certificate");
    }

    toast.success("Certificate Ready!");
    certData = response?.data?.data;
  } catch (error) {
    console.error("GENERATE_CERTIFICATE_API ERROR:", error);
    toast.error(error?.response?.data?.message || error.message || "Failed to generate certificate");
  }
  toast.dismiss(toastId);
  return certData;
};

// ---- Course Completion Certificate ----
// Only succeeds if student has completed 100% of all lectures
export const generateCourseCertificate = async (courseId, token) => {
  const toastId = toast.loading("Checking course completion...");
  let certData = null;
  try {
    const response = await apiConnector(
      "POST",
      GENERATE_COURSE_CERTIFICATE_API,
      { courseId },
      { Authorization: `Bearer ${token}` }
    );

    if (!response?.data?.success) {
      // Surface progress info if the backend returned it
      const progress = response?.data?.data;
      const msg = response?.data?.message || "Could not generate certificate";
      throw new Error(msg + (progress ? ` (${progress.completed}/${progress.total} completed)` : ""));
    }

    toast.success("🎉 Course Certificate Ready!");
    certData = response?.data?.data;
  } catch (error) {
    console.error("GENERATE_COURSE_CERTIFICATE_API ERROR:", error);
    // Show the detailed message from backend (includes progress info)
    const errMsg =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to generate certificate";
    toast.error(errMsg, { duration: 5000 });
  }
  toast.dismiss(toastId);
  return certData;
};

// ---- Verify Certificate (public) ----
export const verifyCertificate = async (code) => {
  try {
    const response = await apiConnector(
      "GET",
      `${VERIFY_CERTIFICATE_API}/${code}`
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Invalid certificate code");
    }

    return response?.data?.data;
  } catch (error) {
    console.error("VERIFY_CERTIFICATE_API ERROR:", error);
    return null;
  }
};
