const BASE_URL = import.meta.env.VITE_APP_BASE_URL;

// AUTH ENDPOINTS
export const endpoints = {
  SENDOTP_API: BASE_URL + "/auth/sendotp",
  SIGNUP_API: BASE_URL + "/auth/signup",
  LOGIN_API: BASE_URL + "/auth/login",
  RESETPASSTOKEN_API: BASE_URL + "/auth/reset-password-token",
  RESETPASSWORD_API: BASE_URL + "/auth/reset-password",
}

// PROFILE ENDPOINTS
export const profileEndpoints = {
  GET_USER_DETAILS_API: BASE_URL + "/profile/getUserDetails",
  GET_USER_ENROLLED_COURSES_API: BASE_URL + "/profile/getEnrolledCourses",
  UNENROLL_COURSE_API: BASE_URL + "/profile/unenrollCourse",
  GET_INSTRUCTOR_DATA_API: BASE_URL + "/profile/instructorDashboard",
}

// STUDENTS ENDPOINTS
export const studentEndpoints = {
  COURSE_PAYMENT_API: BASE_URL + "/payment/capturePayment",
  COURSE_VERIFY_API: BASE_URL + "/payment/verifyPayment",
  SEND_PAYMENT_SUCCESS_EMAIL_API: BASE_URL + "/payment/sendPaymentSuccessEmail",
}

// COURSE ENDPOINTS
export const courseEndpoints = {
  GET_ALL_COURSE_API: BASE_URL + "/course/getAllCourses",
  COURSE_DETAILS_API: BASE_URL + "/course/getCourseDetails",
  EDIT_COURSE_API: BASE_URL + "/course/editCourse",
  COURSE_CATEGORIES_API: BASE_URL + "/course/showAllCategories",
  CREATE_COURSE_API: BASE_URL + "/course/createCourse",
  CREATE_SECTION_API: BASE_URL + "/course/addSection",
  CREATE_SUBSECTION_API: BASE_URL + "/course/addSubSection",
  UPDATE_SECTION_API: BASE_URL + "/course/updateSection",
  UPDATE_SUBSECTION_API: BASE_URL + "/course/updateSubSection",
  GET_ALL_INSTRUCTOR_COURSES_API: BASE_URL + "/course/getInstructorCourses",
  DELETE_SECTION_API: BASE_URL + "/course/deleteSection",
  DELETE_SUBSECTION_API: BASE_URL + "/course/deleteSubSection",
  DELETE_COURSE_API: BASE_URL + "/course/deleteCourse",
  GET_FULL_COURSE_DETAILS_AUTHENTICATED: BASE_URL + "/course/getFullCourseDetails",
  LECTURE_COMPLETION_API: BASE_URL + "/course/updateCourseProgress",
  CREATE_RATING_API: BASE_URL + "/course/createRating",
}

// RATINGS AND REVIEWS
export const ratingsEndpoints = {
  REVIEWS_DETAILS_API: BASE_URL + "/course/getReviews",
}

// CATAGORIES API
export const categories = {
  CATEGORIES_API: BASE_URL + "/course/showAllCategories",
}

// CATALOG PAGE DATA
export const catalogData = {
  CATALOGPAGEDATA_API: BASE_URL + "/course/getCategoryPageDetails",
}
// CONTACT-US API
export const contactusEndpoint = {
  CONTACT_US_API: BASE_URL + "/reach/contact",
}

// SETTINGS PAGE API
export const settingsEndpoints = {
  UPDATE_DISPLAY_PICTURE_API: BASE_URL + "/profile/updateUserProfileImage",
  UPDATE_PROFILE_API: BASE_URL + "/profile/updateProfile",
  CHANGE_PASSWORD_API: BASE_URL + "/auth/changepassword",
  DELETE_PROFILE_API: BASE_URL + "/profile/deleteProfile",
}

// CLASSROOM ENDPOINTS
export const classroomEndpoints = {
  CREATE_CLASSROOM_API: BASE_URL + "/classroom/create",
  JOIN_CLASSROOM_API: BASE_URL + "/classroom/join",
  LEAVE_CLASSROOM_API: BASE_URL + "/classroom/leave",
  GET_CLASSROOM_DETAILS_API: BASE_URL + "/classroom/details",
  GET_MY_CLASSROOMS_API: BASE_URL + "/classroom/my-classrooms",
  POST_MATERIAL_API: BASE_URL + "/classroom/post-material",
  POST_NOTICE_API: BASE_URL + "/classroom/post-notice",
  CREATE_ASSIGNMENT_API: BASE_URL + "/classroom/create-assignment",
  EXTEND_DEADLINE_API: BASE_URL + "/classroom/extend-deadline",
  SUBMIT_ASSIGNMENT_API: BASE_URL + "/classroom/submit-assignment",
  DELETE_SUBMISSION_API: BASE_URL + "/classroom/delete-submission",
  DELETE_CLASSROOM_API: BASE_URL + "/classroom/delete",
  GET_ALL_CLASSROOMS_API: BASE_URL + "/classroom/all",
  GET_ALL_CLASSROOMS_PUBLIC_API: BASE_URL + "/classroom/all-classrooms",
}

// ADMIN ENDPOINTS
export const adminEndpoints = {
  ADMIN_LOGIN_API: BASE_URL + "/auth/admin-login",
  GET_ALL_USERS_API: BASE_URL + "/profile/getUserDetails",
}

// QUIZ ENDPOINTS
export const quizEndpoints = {
  CREATE_QUIZ_API: BASE_URL + "/quiz/create",
  SUBMIT_QUIZ_API: BASE_URL + "/quiz/submit",
  GET_CLASSROOM_QUIZZES_API: BASE_URL + "/quiz/classroom",
  GET_QUIZ_BY_SUBSECTION_API: BASE_URL + "/quiz/subsection",
  GET_QUIZ_BY_ID_API: BASE_URL + "/quiz",
}

// CERTIFICATE ENDPOINTS
export const certificateEndpoints = {
  GENERATE_CERTIFICATE_API: BASE_URL + "/certificate/generate",
  GENERATE_COURSE_CERTIFICATE_API: BASE_URL + "/certificate/generate-course",
  VERIFY_CERTIFICATE_API: BASE_URL + "/certificate/verify",
}