import { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
import { VscAdd, VscVm, VscCommentDiscussion, VscGraph, VscOrganization, VscPass } from "react-icons/vsc"
import { MdOutlineClass, MdAdd, MdPeople } from "react-icons/md"

import { fetchInstructorCourses } from "../../../services/operations/courseDetailsAPI"
import { getInstructorData } from "../../../services/operations/profileAPI"
import { fetchMyClassrooms } from "../../../services/operations/classroomAPI"
import InstructorChart from "./InstructorDashboard/InstructorChart"
import Img from './../../common/Img'
import Loading from "../../common/Loading"

export default function Instructor() {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const { classrooms } = useSelector((state) => state.classroom)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [instructorData, setInstructorData] = useState(null)
  const [courses, setCourses] = useState([])

  // Fetch Instructor Data and Classrooms
  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const instructorApiData = await getInstructorData(token)
        const result = await fetchInstructorCourses(token)
        dispatch(fetchMyClassrooms(token))

        if (instructorApiData?.length) setInstructorData(instructorApiData)
        if (result) setCourses(result)
      } catch (error) {
        console.error("Error fetching instructor data:", error)
      } finally {
        setLoading(false)
      }
    })()
  }, [token, dispatch])

  const totalAmount = instructorData?.reduce((acc, curr) => acc + curr.totalAmountGenerated, 0) || 0
  const totalStudents = instructorData?.reduce((acc, curr) => acc + curr.totalStudentsEnrolled, 0) || 0
  const totalClassrooms = classrooms?.length || 0

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
        <Loading />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Instructor Welcome & Quick Action Header */}
      <div className="rounded-2xl border border-richblack-700 bg-gradient-to-r from-richblack-800 via-richblack-800 to-richblack-700 p-6 shadow-lg sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-yellow-50/30 bg-yellow-50/10 px-3 py-1 text-xs font-semibold text-yellow-50 mb-2">
              <span>👨‍🏫 INSTRUCTOR STUDIO</span>
            </div>
            <h1 className="text-2xl font-bold text-richblack-5 sm:text-3xl">
              Hello, {user?.firstName} 👋
            </h1>
            <p className="mt-1 text-sm text-richblack-300">
              Manage your courses, monitor student enrollments, and coordinate classrooms.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/dashboard/add-course")}
              className="flex items-center gap-2 rounded-xl bg-yellow-50 px-4 py-2.5 text-sm font-semibold text-richblack-900 hover:bg-yellow-25 transition-all shadow-md cursor-pointer"
            >
              <VscAdd size={18} /> Create Course
            </button>
            <button
              onClick={() => navigate("/dashboard/create-classroom")}
              className="flex items-center gap-2 rounded-xl border border-richblack-600 bg-richblack-700 px-4 py-2.5 text-sm font-semibold text-richblack-5 hover:bg-richblack-600 transition-all shadow-md cursor-pointer"
            >
              <MdAdd size={18} /> Create Classroom
            </button>
          </div>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Courses */}
        <div className="flex items-center gap-4 rounded-xl border border-richblack-700 bg-richblack-800 p-5 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-50/10 text-yellow-50">
            <VscVm size={26} />
          </div>
          <div>
            <p className="text-xs font-medium text-richblack-300">Total Courses</p>
            <p className="text-2xl font-bold text-richblack-5">{courses.length}</p>
          </div>
        </div>

        {/* Total Enrolled Students */}
        <div className="flex items-center gap-4 rounded-xl border border-richblack-700 bg-richblack-800 p-5 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
            <VscOrganization size={26} />
          </div>
          <div>
            <p className="text-xs font-medium text-richblack-300">Total Students</p>
            <p className="text-2xl font-bold text-richblack-5">{totalStudents}</p>
          </div>
        </div>

        {/* Total Classrooms */}
        <div className="flex items-center gap-4 rounded-xl border border-richblack-700 bg-richblack-800 p-5 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-caribbeangreen-500/10 text-caribbeangreen-300">
            <VscCommentDiscussion size={26} />
          </div>
          <div>
            <p className="text-xs font-medium text-richblack-300">Created Classrooms</p>
            <p className="text-2xl font-bold text-richblack-5">{totalClassrooms}</p>
          </div>
        </div>

        {/* Total Earnings */}
        <div className="flex items-center gap-4 rounded-xl border border-richblack-700 bg-richblack-800 p-5 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-500/10 text-pink-300">
            <VscGraph size={26} />
          </div>
          <div>
            <p className="text-xs font-medium text-richblack-300">Total Income</p>
            <p className="text-2xl font-bold text-richblack-5">Rs. {totalAmount}</p>
          </div>
        </div>
      </div>

      {/* Analytics Chart & Statistics Section */}
      {courses.length > 0 && (
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Chart Container */}
          <div className="flex-1">
            {totalAmount > 0 || totalStudents > 0 ? (
              <InstructorChart courses={instructorData} />
            ) : (
              <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-richblack-700 bg-richblack-800 p-6 text-center shadow-md">
                <VscGraph size={48} className="mb-2 text-richblack-500" />
                <p className="text-lg font-semibold text-richblack-5">Awaiting Student Enrollments</p>
                <p className="mt-1 text-xs text-richblack-300">
                  Analytics chart will appear automatically once students enroll in your courses.
                </p>
              </div>
            )}
          </div>

          {/* Quick Stats Summary */}
          <div className="flex min-w-[280px] flex-col rounded-2xl border border-richblack-700 bg-richblack-800 p-6 shadow-md">
            <p className="text-lg font-bold text-richblack-5">Performance Summary</p>
            <div className="mt-6 space-y-6">
              <div className="rounded-xl border border-richblack-700 bg-richblack-900 p-4">
                <p className="text-xs font-medium text-richblack-300">Active Courses</p>
                <p className="mt-1 text-2xl font-bold text-yellow-50">{courses.length}</p>
              </div>

              <div className="rounded-xl border border-richblack-700 bg-richblack-900 p-4">
                <p className="text-xs font-medium text-richblack-300">Total Revenue</p>
                <p className="mt-1 text-2xl font-bold text-caribbeangreen-300">Rs. {totalAmount}</p>
              </div>

              <div className="rounded-xl border border-richblack-700 bg-richblack-900 p-4">
                <p className="text-xs font-medium text-richblack-300">Students Enrolled</p>
                <p className="mt-1 text-2xl font-bold text-blue-100">{totalStudents}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Your Courses Section */}
      <div className="rounded-2xl border border-richblack-700 bg-richblack-800 p-6 shadow-md">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-richblack-5">Your Created Courses</h2>
          <Link to="/dashboard/my-courses" className="text-xs font-semibold text-yellow-50 hover:underline">
            View All Courses ({courses.length})
          </Link>
        </div>

        {courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <VscVm size={48} className="mb-3 text-richblack-500" />
            <p className="text-lg font-semibold text-richblack-5">You haven't created any courses yet</p>
            <p className="mt-1 text-xs text-richblack-300">Start sharing your expertise by publishing your first course.</p>
            <button
              onClick={() => navigate("/dashboard/add-course")}
              className="mt-4 flex items-center gap-2 rounded-xl bg-yellow-50 px-4 py-2 text-sm font-semibold text-richblack-900 hover:bg-yellow-25"
            >
              <VscAdd size={16} /> Create Your First Course
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.slice(0, 3).map((course) => (
              <div key={course._id} className="flex flex-col justify-between rounded-xl border border-richblack-700 bg-richblack-900 p-4 transition-all hover:border-richblack-500">
                <div>
                  <Img
                    src={course.thumbnail}
                    alt={course.courseName}
                    className="h-40 w-full rounded-lg object-cover"
                  />
                  <h3 className="mt-3 text-base font-semibold text-richblack-5 line-clamp-1">
                    {course.courseName}
                  </h3>
                  <p className="mt-1 text-xs text-richblack-300 line-clamp-2">
                    {course.courseDescription}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between pt-3 border-t border-richblack-800">
                  <div className="text-xs text-richblack-300">
                    <span className="font-semibold text-richblack-5">{course.studentsEnrolled?.length || 0}</span> students | <span className="font-semibold text-yellow-50">Rs. {course.price}</span>
                  </div>
                  <button
                    onClick={() => navigate(`/dashboard/edit-course/${course._id}`)}
                    className="rounded-lg bg-richblack-700 px-3 py-1.5 text-xs font-semibold text-richblack-5 hover:bg-richblack-600 transition-all"
                  >
                    Edit Course
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Created Classrooms Section */}
      <div className="rounded-2xl border border-richblack-700 bg-richblack-800 p-6 shadow-md">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-richblack-5">Your Classrooms</h2>
          <Link to="/dashboard/my-classrooms" className="text-xs font-semibold text-yellow-50 hover:underline">
            Manage Classrooms ({totalClassrooms})
          </Link>
        </div>

        {totalClassrooms === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <MdOutlineClass size={44} className="mb-3 text-richblack-500" />
            <p className="text-richblack-300">You haven't created any classrooms yet.</p>
            <button
              onClick={() => navigate("/dashboard/create-classroom")}
              className="mt-4 flex items-center gap-2 rounded-xl bg-yellow-50 px-4 py-2 text-sm font-semibold text-richblack-900"
            >
              <MdAdd size={16} /> Create Classroom
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {classrooms.slice(0, 2).map((cls) => (
              <div key={cls._id} className="flex flex-col justify-between rounded-xl border border-richblack-700 bg-richblack-900 p-5">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-richblack-5">{cls.className}</h3>
                    <span className="font-mono text-xs text-yellow-50 bg-yellow-50/10 px-2.5 py-1 rounded-md border border-yellow-50/20">
                      Code: {cls.uniqueCode}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-richblack-300 line-clamp-2">{cls.description}</p>
                </div>

                <div className="mt-4 flex items-center justify-between pt-3 border-t border-richblack-800">
                  <div className="flex items-center gap-1 text-xs text-richblack-400">
                    <MdPeople size={14} />
                    <span>{cls.studentsEnrolled?.length || 0} students enrolled</span>
                  </div>
                  <button
                    onClick={() => navigate(`/classroom/${cls._id}`)}
                    className="rounded-lg bg-yellow-50 px-3.5 py-1.5 text-xs font-semibold text-richblack-900 hover:bg-yellow-25"
                  >
                    Open Classroom
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
