import { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
import ProgressBar from "@ramonak/react-progress-bar"
import { VscBook, VscMortarBoard, VscCommentDiscussion, VscCheckAll, VscArrowRight, VscPlayCircle } from "react-icons/vsc"
import { MdOutlineClass, MdPeople } from "react-icons/md"

import { getUserEnrolledCourses } from "../../../services/operations/profileAPI"
import { fetchMyClassrooms } from "../../../services/operations/classroomAPI"
import Img from "../../common/Img"
import Loading from "../../common/Loading"

export default function StudentDashboard() {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const { classrooms } = useSelector((state) => state.classroom)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [enrolledCourses, setEnrolledCourses] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const coursesRes = await getUserEnrolledCourses(token)
        setEnrolledCourses(coursesRes || [])
        dispatch(fetchMyClassrooms(token))
      } catch (error) {
        console.error("Error fetching student dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [token, dispatch])

  const totalCourses = enrolledCourses?.length || 0
  const totalClassrooms = classrooms?.length || 0
  
  const completedCoursesCount = enrolledCourses?.filter(
    (c) => (c.progressPercentage || 0) === 100
  ).length || 0

  const averageProgress = totalCourses > 0
    ? Math.round(
        enrolledCourses.reduce((acc, curr) => acc + (curr.progressPercentage || 0), 0) / totalCourses
      )
    : 0

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
        <Loading />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-richblack-700 bg-gradient-to-r from-richblack-800 via-richblack-800 to-richblack-700 p-6 shadow-lg sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-richblack-5 sm:text-3xl">
              Welcome back, {user?.firstName} 👋
            </h1>
            <p className="mt-2 text-sm text-richblack-300">
              Track your course progress, joined classrooms, and learning journey here.
            </p>
          </div>
          <Link to="/catalog/web-development">
            <button className="flex items-center gap-2 rounded-xl bg-yellow-50 px-5 py-2.5 text-sm font-semibold text-richblack-900 hover:bg-yellow-25 transition-all shadow-md">
              Explore New Courses <VscArrowRight className="text-base" />
            </button>
          </Link>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Enrolled Courses */}
        <div className="flex items-center gap-4 rounded-xl border border-richblack-700 bg-richblack-800 p-5 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-50/10 text-yellow-50">
            <VscMortarBoard size={26} />
          </div>
          <div>
            <p className="text-xs font-medium text-richblack-300">Enrolled Courses</p>
            <p className="text-2xl font-bold text-richblack-5">{totalCourses}</p>
          </div>
        </div>

        {/* Joined Classrooms */}
        <div className="flex items-center gap-4 rounded-xl border border-richblack-700 bg-richblack-800 p-5 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
            <VscCommentDiscussion size={26} />
          </div>
          <div>
            <p className="text-xs font-medium text-richblack-300">Active Classrooms</p>
            <p className="text-2xl font-bold text-richblack-5">{totalClassrooms}</p>
          </div>
        </div>

        {/* Avg Progress */}
        <div className="flex items-center gap-4 rounded-xl border border-richblack-700 bg-richblack-800 p-5 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-caribbeangreen-500/10 text-caribbeangreen-300">
            <VscBook size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-richblack-300">Average Progress</p>
            <p className="text-2xl font-bold text-richblack-5">{averageProgress}%</p>
          </div>
        </div>

        {/* Completed Courses */}
        <div className="flex items-center gap-4 rounded-xl border border-richblack-700 bg-richblack-800 p-5 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-500/10 text-pink-300">
            <VscCheckAll size={26} />
          </div>
          <div>
            <p className="text-xs font-medium text-richblack-300">Completed Courses</p>
            <p className="text-2xl font-bold text-richblack-5">{completedCoursesCount}</p>
          </div>
        </div>
      </div>

      {/* Continue Learning / Enrolled Courses Section */}
      <div className="rounded-2xl border border-richblack-700 bg-richblack-800 p-6 shadow-md">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-richblack-5">Continue Learning</h2>
          <Link to="/dashboard/enrolled-courses" className="text-xs font-semibold text-yellow-50 hover:underline">
            View All Courses ({totalCourses})
          </Link>
        </div>

        {totalCourses === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <VscMortarBoard size={48} className="mb-3 text-richblack-500" />
            <p className="text-richblack-300">You haven't enrolled in any courses yet.</p>
            <Link to="/catalog/web-development" className="mt-4 rounded-lg bg-yellow-50 px-4 py-2 text-sm font-semibold text-richblack-900">
              Browse Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {enrolledCourses.slice(0, 3).map((course) => (
              <div key={course._id} className="flex flex-col justify-between rounded-xl border border-richblack-700 bg-richblack-900 p-4 transition-all hover:border-richblack-500">
                <div>
                  <Img
                    src={course.thumbnail}
                    alt={course.courseName}
                    className="h-36 w-full rounded-lg object-cover"
                  />
                  <h3 className="mt-3 text-base font-semibold text-richblack-5 line-clamp-1">
                    {course.courseName}
                  </h3>
                  <p className="mt-1 text-xs text-richblack-300 line-clamp-2">
                    {course.courseDescription}
                  </p>
                </div>

                <div className="mt-4 space-y-3">
                  <div>
                    <div className="flex justify-between text-xs text-richblack-300 mb-1">
                      <span>Progress</span>
                      <span className="font-semibold text-yellow-50">{course.progressPercentage || 0}%</span>
                    </div>
                    <ProgressBar
                      completed={course.progressPercentage || 0}
                      height="7px"
                      isLabelVisible={false}
                      bgColor="#ffd60a"
                    />
                  </div>

                  <button
                    onClick={() => {
                      const firstSection = course.courseContent?.[0]?._id
                      const firstSubSection = course.courseContent?.[0]?.subSection?.[0]?._id
                      if (firstSection && firstSubSection) {
                        navigate(`/view-course/${course._id}/section/${firstSection}/sub-section/${firstSubSection}`)
                      } else {
                        navigate("/dashboard/enrolled-courses")
                      }
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-richblack-700 py-2 text-xs font-semibold text-richblack-5 hover:bg-richblack-600 transition-all"
                  >
                    <VscPlayCircle size={16} className="text-yellow-50" /> Continue Lecture
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Joined Classrooms Quick Access */}
      <div className="rounded-2xl border border-richblack-700 bg-richblack-800 p-6 shadow-md">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-richblack-5">Joined Classrooms</h2>
          <Link to="/dashboard/joined-classrooms" className="text-xs font-semibold text-yellow-50 hover:underline">
            View All Classrooms ({totalClassrooms})
          </Link>
        </div>

        {totalClassrooms === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <MdOutlineClass size={44} className="mb-3 text-richblack-500" />
            <p className="text-richblack-300">You haven't joined any classrooms yet.</p>
            <Link to="/dashboard/joined-classrooms" className="mt-4 rounded-lg border border-richblack-600 px-4 py-2 text-sm text-richblack-200 hover:bg-richblack-700">
              Join a Classroom
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {classrooms.slice(0, 2).map((cls) => (
              <div key={cls._id} className="flex flex-col justify-between rounded-xl border border-richblack-700 bg-richblack-900 p-5">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-richblack-5">{cls.className}</h3>
                    <span className="font-mono text-xs text-yellow-50 bg-yellow-50/10 px-2 py-1 rounded">
                      {cls.uniqueCode}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-richblack-300 line-clamp-2">{cls.description}</p>
                </div>

                <div className="mt-4 flex items-center justify-between pt-3 border-t border-richblack-800">
                  <div className="flex items-center gap-1 text-xs text-richblack-400">
                    <MdPeople size={14} />
                    <span>{cls.studentsEnrolled?.length || 0} classmates</span>
                  </div>
                  <button
                    onClick={() => navigate(`/classroom/${cls._id}`)}
                    className="rounded-lg bg-yellow-50 px-3 py-1.5 text-xs font-semibold text-richblack-900 hover:bg-yellow-25"
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
