import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { apiConnector } from "../services/apiConnector";
import { classroomEndpoints, courseEndpoints } from "../services/apis";
import { logout } from "../services/operations/authAPI";
import {
  MdPeople,
  MdOutlineClass,
  MdCategory,
  MdLogout,
  MdAdminPanelSettings,
  MdDelete,
  MdBook,
} from "react-icons/md";
import { HiAcademicCap } from "react-icons/hi";

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-richblack-700 bg-richblack-800 p-5 shadow-md">
      <div className={`flex h-12 w-12 items-center justify-center rounded-full ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-richblack-5">{value}</p>
        <p className="text-sm text-richblack-300">{label}</p>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("classrooms"); // 'classrooms' | 'courses'

  const [stats, setStats] = useState({ classrooms: 0, courses: 0, students: 0, instructors: 0 });
  const [classrooms, setClassrooms] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [confirmDelete, setConfirmDelete] = useState(null); // { type: 'classroom'|'course', id, name }
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchAdminData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Classrooms
      const resClassrooms = await apiConnector(
        "GET",
        classroomEndpoints.GET_ALL_CLASSROOMS_API,
        null,
        { Authorization: `Bearer ${token}` }
      );

      // 2. Fetch Courses
      const resCourses = await apiConnector("GET", courseEndpoints.GET_ALL_COURSE_API);

      let fetchedClassrooms = [];
      let fetchedCourses = [];

      if (resClassrooms?.data?.success) {
        fetchedClassrooms = resClassrooms.data.data;
        setClassrooms(fetchedClassrooms);
      }

      if (resCourses?.data?.success) {
        fetchedCourses = resCourses.data.data;
        setCourses(fetchedCourses);
      }

      // Calculate stats
      const studentSet = new Set();
      const instructorSet = new Set();

      fetchedClassrooms.forEach((c) => {
        if (c.instructor?._id) instructorSet.add(c.instructor._id);
        c.studentsEnrolled?.forEach((s) => studentSet.add(s?._id || s));
      });

      fetchedCourses.forEach((c) => {
        if (c.instructor?._id) instructorSet.add(c.instructor._id);
        c.studentsEnrolled?.forEach((s) => studentSet.add(s?._id || s));
      });

      setStats({
        classrooms: fetchedClassrooms.length,
        courses: fetchedCourses.length,
        students: studentSet.size,
        instructors: instructorSet.size,
      });
    } catch (err) {
      console.error("Admin data fetch error:", err);
      toast.error("Failed to load platform dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClassroom = async (classroomId) => {
    setDeleting(true);
    const toastId = toast.loading("Deleting classroom...");
    try {
      const response = await apiConnector(
        "DELETE",
        classroomEndpoints.DELETE_CLASSROOM_API,
        { classroomId },
        { Authorization: `Bearer ${token}` }
      );

      if (response?.data?.success) {
        toast.success("Classroom deleted successfully");
        setConfirmDelete(null);
        await fetchAdminData();
      } else {
        throw new Error(response?.data?.message || "Failed to delete classroom");
      }
    } catch (error) {
      console.error("Error deleting classroom:", error);
      toast.error(error?.response?.data?.message || error.message || "Could not delete classroom");
    } finally {
      setDeleting(false);
      toast.dismiss(toastId);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    setDeleting(true);
    const toastId = toast.loading("Deleting course...");
    try {
      const response = await apiConnector(
        "DELETE",
        courseEndpoints.DELETE_COURSE_API,
        { courseId },
        { Authorization: `Bearer ${token}` }
      );

      if (response?.data?.success) {
        toast.success("Course deleted successfully");
        setConfirmDelete(null);
        await fetchAdminData();
      } else {
        throw new Error(response?.data?.message || "Failed to delete course");
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      toast.error(error?.response?.data?.message || error.message || "Could not delete course");
    } finally {
      setDeleting(false);
      toast.dismiss(toastId);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-richblack-900 px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-50">
            <MdAdminPanelSettings size={28} className="text-richblack-900" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-richblack-5">
              Platform Admin Console
            </h1>
            <p className="text-sm text-richblack-300">
              Welcome back, Super Admin {user?.firstName} {user?.lastName}
            </p>
          </div>
        </div>
        <button
          onClick={() => dispatch(logout(navigate))}
          className="flex w-fit items-center gap-2 rounded-lg border border-richblack-600 bg-richblack-800 px-4 py-2 text-sm text-richblack-300 hover:bg-richblack-700 transition-all"
        >
          <MdLogout size={16} />
          Logout
        </button>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={MdOutlineClass}
          label="Total Classrooms"
          value={stats.classrooms}
          color="bg-blue-600"
        />
        <StatCard
          icon={MdBook}
          label="Total Courses"
          value={stats.courses}
          color="bg-purple-600"
        />
        <StatCard
          icon={MdPeople}
          label="Total Students"
          value={stats.students}
          color="bg-green-600"
        />
        <StatCard
          icon={HiAcademicCap}
          label="Total Instructors"
          value={stats.instructors}
          color="bg-yellow-600"
        />
      </div>

      {/* Tab Controls */}
      <div className="mb-6 flex border-b border-richblack-700 gap-6">
        <button
          onClick={() => setActiveTab("classrooms")}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 transition-all border-b-2 ${
            activeTab === "classrooms"
              ? "border-yellow-50 text-yellow-50"
              : "border-transparent text-richblack-400 hover:text-richblack-200"
          }`}
        >
          <MdOutlineClass size={18} />
          All Classrooms ({classrooms.length})
        </button>

        <button
          onClick={() => setActiveTab("courses")}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 transition-all border-b-2 ${
            activeTab === "courses"
              ? "border-yellow-50 text-yellow-50"
              : "border-transparent text-richblack-400 hover:text-richblack-200"
          }`}
        >
          <MdBook size={18} />
          All Courses ({courses.length})
        </button>
      </div>

      {/* Classrooms Section */}
      {activeTab === "classrooms" && (
        <div className="rounded-xl border border-richblack-700 bg-richblack-800 p-6 shadow-md">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MdCategory size={20} className="text-yellow-50" />
              <h2 className="text-lg font-semibold text-richblack-5">Platform Classrooms</h2>
            </div>
          </div>

          {loading ? (
            <p className="text-center text-richblack-400 py-8">Loading classrooms...</p>
          ) : classrooms.length === 0 ? (
            <p className="text-center text-richblack-400 py-8">
              No classrooms found on the platform.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-richblack-300">
                <thead className="border-b border-richblack-700 text-richblack-200">
                  <tr>
                    <th className="pb-3 pr-4">Classroom Name</th>
                    <th className="pb-3 pr-4">Instructor</th>
                    <th className="pb-3 pr-4">Code</th>
                    <th className="pb-3 pr-4">Duration</th>
                    <th className="pb-3 pr-4">Students</th>
                    <th className="pb-3 pr-4">Created</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-richblack-700">
                  {classrooms.map((cls) => (
                    <tr key={cls._id} className="hover:bg-richblack-700/50 transition-colors">
                      <td className="py-3 pr-4 font-medium text-richblack-5">
                        {cls.className}
                      </td>
                      <td className="py-3 pr-4">
                        {cls.instructor
                          ? `${cls.instructor.firstName} ${cls.instructor.lastName}`
                          : "—"}
                      </td>
                      <td className="py-3 pr-4">
                        <span className="rounded bg-richblack-700 px-2 py-1 font-mono text-yellow-100">
                          {cls.uniqueCode}
                        </span>
                      </td>
                      <td className="py-3 pr-4">{cls.duration}</td>
                      <td className="py-3 pr-4">{cls.studentsEnrolled?.length ?? 0}</td>
                      <td className="py-3 pr-4 text-richblack-400">
                        {new Date(cls.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() =>
                            setConfirmDelete({
                              type: "classroom",
                              id: cls._id,
                              name: cls.className,
                            })
                          }
                          className="rounded-lg bg-red-950/60 border border-red-800 p-2 text-red-300 hover:bg-red-800 hover:text-white transition-all"
                          title="Delete Classroom"
                        >
                          <MdDelete size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Courses Section */}
      {activeTab === "courses" && (
        <div className="rounded-xl border border-richblack-700 bg-richblack-800 p-6 shadow-md">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MdBook size={20} className="text-yellow-50" />
              <h2 className="text-lg font-semibold text-richblack-5">Platform Courses</h2>
            </div>
          </div>

          {loading ? (
            <p className="text-center text-richblack-400 py-8">Loading courses...</p>
          ) : courses.length === 0 ? (
            <p className="text-center text-richblack-400 py-8">
              No courses found on the platform.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-richblack-300">
                <thead className="border-b border-richblack-700 text-richblack-200">
                  <tr>
                    <th className="pb-3 pr-4">Course Name</th>
                    <th className="pb-3 pr-4">Instructor</th>
                    <th className="pb-3 pr-4">Price</th>
                    <th className="pb-3 pr-4">Students Enrolled</th>
                    <th className="pb-3 pr-4">Created</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-richblack-700">
                  {courses.map((course) => (
                    <tr key={course._id} className="hover:bg-richblack-700/50 transition-colors">
                      <td className="py-3 pr-4 font-medium text-richblack-5 flex items-center gap-3">
                        {course.thumbnail && (
                          <img
                            src={course.thumbnail}
                            alt={course.courseName}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        )}
                        <span>{course.courseName}</span>
                      </td>
                      <td className="py-3 pr-4">
                        {course.instructor
                          ? `${course.instructor.firstName} ${course.instructor.lastName}`
                          : "—"}
                      </td>
                      <td className="py-3 pr-4 text-yellow-100 font-semibold">
                        ₹{course.price}
                      </td>
                      <td className="py-3 pr-4">{course.studentsEnrolled?.length ?? 0}</td>
                      <td className="py-3 pr-4 text-richblack-400">
                        {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() =>
                            setConfirmDelete({
                              type: "course",
                              id: course._id,
                              name: course.courseName,
                            })
                          }
                          className="rounded-lg bg-red-950/60 border border-red-800 p-2 text-red-300 hover:bg-red-800 hover:text-white transition-all"
                          title="Delete Course"
                        >
                          <MdDelete size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Deletion Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-richblack-700 bg-richblack-800 p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-richblack-5 mb-2">
              Confirm Deletion
            </h3>
            <p className="text-sm text-richblack-300 mb-6">
              Are you sure you want to delete the {confirmDelete.type}{" "}
              <span className="font-semibold text-white">"{confirmDelete.name}"</span>? This
              action cannot be undone and will remove all associated user enrollments.
            </p>
            <div className="flex justify-end gap-3">
              <button
                disabled={deleting}
                onClick={() => setConfirmDelete(null)}
                className="rounded-lg bg-richblack-700 px-4 py-2 text-sm text-richblack-300 hover:bg-richblack-600 transition-all"
              >
                Cancel
              </button>
              <button
                disabled={deleting}
                onClick={() =>
                  confirmDelete.type === "classroom"
                    ? handleDeleteClassroom(confirmDelete.id)
                    : handleDeleteCourse(confirmDelete.id)
                }
                className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 transition-all disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
