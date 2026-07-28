
import { useEffect, useState } from "react";
import { Route, Routes, useLocation, Link, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import Home from "./pages/Home"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import ForgotPassword from "./pages/ForgotPassword";
import UpdatePassword from "./pages/UpdatePassword";
import VerifyEmail from "./pages/VerifyEmail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import PageNotFound from "./pages/PageNotFound";
import CourseDetails from './pages/CourseDetails';
import Catalog from './pages/Catalog';
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import ClassroomView from "./pages/ClassroomView";
import JoinClassroom from "./pages/JoinClassroom";
import CertificateView from "./pages/CertificateView";
 
import Navbar from "./components/common/Navbar"

import OpenRoute from "./components/core/Auth/OpenRoute"
import ProtectedRoute from "./components/core/Auth/ProtectedRoute";
import AdminRoute from "./components/core/Auth/AdminRoute";

import Dashboard from "./pages/Dashboard";
import StudentDashboard from "./components/core/Dashboard/StudentDashboard";
import MyProfile from "./components/core/Dashboard/MyProfile";
import Settings from "./components/core/Dashboard/Settings/Settings";
import MyCourses from './components/core/Dashboard/MyCourses';
import EditCourse from './components/core/Dashboard/EditCourse/EditCourse';
import Instructor from './components/core/Dashboard/Instructor';

import MyClassrooms from './components/core/Dashboard/Classrooms/MyClassrooms';
import CreateClassroom from './components/core/Dashboard/Classrooms/CreateClassroom';
import EnrolledClassrooms from './components/core/Dashboard/Classrooms/EnrolledClassrooms';

import Cart from "./components/core/Dashboard/Cart/Cart";
import EnrolledCourses from "./components/core/Dashboard/EnrolledCourses";
import AddCourse from "./components/core/Dashboard/AddCourse/AddCourse";

import ViewCourse from "./pages/ViewCourse";
import VideoDetails from './components/core/ViewCourse/VideoDetails';

import { useDispatch } from "react-redux";
import { getUserDetails } from "./services/operations/profileAPI";
import { ACCOUNT_TYPE } from './utils/constants';

import { HiArrowNarrowUp } from "react-icons/hi"

const DashboardIndex = () => {
  const { user } = useSelector((state) => state.profile);
  if (user?.accountType === ACCOUNT_TYPE.INSTRUCTOR) {
    return <Navigate to="/dashboard/instructor" replace />;
  }
  if (user?.accountType === ACCOUNT_TYPE.ADMIN) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <Navigate to="/dashboard/student" replace />;
};


function App() {

  const { user } = useSelector((state) => state.profile);
  const { theme } = useSelector((state) => state.theme || { theme: "dark" });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    if (theme === "light") {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    }
  }, [theme]);

  // Scroll to the top of the page when the component mounts
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname])

  useEffect(() => {
    scrollTo(0, 0);
  }, [location])

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [])


  // Go upward arrow - show , unshow
  const [showArrow, setShowArrow] = useState(false)

  const handleArrow = () => {
    if (window.scrollY > 500) {
      setShowArrow(true)
    } else setShowArrow(false)
  }

  useEffect(() => {
    window.addEventListener('scroll', handleArrow);
    return () => {
      window.removeEventListener('scroll', handleArrow);
    }
  }, [showArrow])


  return (
    <div className="w-screen min-h-screen bg-richblack-900 flex flex-col font-inter">
      <Navbar />

      {/* go upward arrow */}
      <button onClick={() => window.scrollTo(0, 0)}
        className={`bg-yellow-25 hover:bg-yellow-50 hover:scale-110 p-3 text-lg text-black rounded-2xl fixed right-3 z-10 duration-500 ease-in-out ${showArrow ? 'bottom-6' : '-bottom-24'} `} >
        <HiArrowNarrowUp />
      </button>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="catalog/:catalogName" element={<Catalog />} />
        <Route path="courses/:courseId" element={<CourseDetails />} />

        {/* Open Route - for Only Non Logged in User */}
        <Route
          path="signup" element={
            <OpenRoute>
              <Signup />
            </OpenRoute>
          }
        />
        <Route
          path="signup/student" element={
            <OpenRoute>
              <Signup />
            </OpenRoute>
          }
        />
        <Route
          path="signup/instructor" element={
            <OpenRoute>
              <Signup />
            </OpenRoute>
          }
        />

        <Route
          path="login" element={
            <OpenRoute>
              <Login />
            </OpenRoute>
          }
        />

        <Route
          path="forgot-password" element={
            <OpenRoute>
              <ForgotPassword />
            </OpenRoute>
          }
        />

        <Route
          path="verify-email" element={
            <OpenRoute>
              <VerifyEmail />
            </OpenRoute>
          }
        />

        {/* Isolated Super Admin Portal */}
        <Route path="admin-secure-portal/login" element={<AdminLogin />} />
        <Route path="admin/login" element={<AdminLogin />} />
        <Route path="admin-login" element={<AdminLogin />} />
        <Route path="admin" element={<AdminLogin />} />

        <Route
          path="admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        <Route
          path="join/:uniqueCode"
          element={
            <ProtectedRoute>
              <JoinClassroom />
            </ProtectedRoute>
          }
        />

        {/* Public Certificate Verification Routes */}
        <Route path="verify-certificate/:code" element={<CertificateView />} />
        <Route path="certificate/:code" element={<CertificateView />} />

        <Route
          path="update-password/:id" element={
            <OpenRoute>
              <UpdatePassword />
            </OpenRoute>
          }
        />

        {/* Protected Route - for Only Logged in User */}
        {/* Dashboard */}
        <Route element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
        >
          <Route path="dashboard" element={<DashboardIndex />} />
          <Route path="dashboard/my-profile" element={<MyProfile />} />
          <Route path="dashboard/Settings" element={<Settings />} />

          {/* Protected classroom view with sidebar active */}
          <Route path="classroom/:classroomId" element={<ClassroomView />} />

          {/* Route only for Students */}
          {/* cart , EnrolledCourses, Joined Classrooms, StudentDashboard */}
          {user?.accountType === ACCOUNT_TYPE.STUDENT && (
            <>
              <Route path="dashboard/student" element={<StudentDashboard />} />
              <Route path="dashboard/cart" element={<Cart />} />
              <Route path="dashboard/enrolled-courses" element={<EnrolledCourses />} />
              <Route path="dashboard/joined-classrooms" element={<EnrolledClassrooms />} />
            </>
          )}

          {/* Route only for Instructors */}
          {/* add course , MyCourses, EditCourse, Classrooms */}
          {user?.accountType === ACCOUNT_TYPE.INSTRUCTOR && (
            <>
              <Route path="dashboard/instructor" element={<Instructor />} />
              <Route path="dashboard/add-course" element={<AddCourse />} />
              <Route path="dashboard/my-courses" element={<MyCourses />} />
              <Route path="dashboard/edit-course/:courseId" element={<EditCourse />} />
              <Route path="dashboard/my-classrooms" element={<MyClassrooms />} />
              <Route path="dashboard/create-classroom" element={<CreateClassroom />} />
            </>
          )}
        </Route>


        {/* For the watching course lectures */}
        <Route
          element={
            <ProtectedRoute>
              <ViewCourse />
            </ProtectedRoute>
          }
        >
          {user?.accountType === ACCOUNT_TYPE.STUDENT && (
            <Route
              path="view-course/:courseId/section/:sectionId/sub-section/:subSectionId"
              element={<VideoDetails />}
            />
          )}
        </Route>




        {/* Page Not Found (404 Page ) */}
        <Route path="*" element={<PageNotFound />} />

      </Routes>

    </div>
  );
}

export default App;
