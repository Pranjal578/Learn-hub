import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"
import { FaChalkboardTeacher, FaUserGraduate } from "react-icons/fa"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useLocation } from "react-router-dom"

import { signUp } from "../../../services/operations/authAPI"
import { ACCOUNT_TYPE } from "../../../utils/constants"

function SignupForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  const isInstructorRoute = location.pathname.includes("/signup/instructor");
  const accountType = isInstructorRoute ? ACCOUNT_TYPE.INSTRUCTOR : ACCOUNT_TYPE.STUDENT;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { firstName, lastName, email, password, confirmPassword } = formData;

  // Handle input fields
  const handleOnChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };

  // Handle Form Submission
  const handleOnSubmit = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords Do Not Match")
      return;
    }

    // Direct Signup (No OTP required)
    dispatch(signUp(accountType, firstName, lastName, email, password, confirmPassword, "123456", navigate));

    // Reset form data
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    })
  };

  return (
    <div>
      {/* Role Switcher Callout Banner (Replaces Tab Dongle) */}
      {accountType === ACCOUNT_TYPE.STUDENT ? (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-yellow-50/30 bg-richblack-800/90 p-3.5 shadow-md">
          <div className="flex items-center gap-2.5 text-xs text-richblack-200">
            <FaChalkboardTeacher className="text-yellow-50 text-lg" />
            <span>Want to teach on LearnHub?</span>
          </div>
          <button
            type="button"
            onClick={() => navigate("/signup/instructor")}
            className="rounded-lg bg-yellow-50/10 px-3.5 py-1.5 text-xs font-semibold text-yellow-50 hover:bg-yellow-50 hover:text-richblack-900 transition-all cursor-pointer"
          >
            Become an Instructor →
          </button>
        </div>
      ) : (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-blue-200/30 bg-richblack-800/90 p-3.5 shadow-md">
          <div className="flex items-center gap-2.5 text-xs text-richblack-200">
            <FaUserGraduate className="text-blue-100 text-lg" />
            <span>Looking to learn instead?</span>
          </div>
          <button
            type="button"
            onClick={() => navigate("/signup/student")}
            className="rounded-lg bg-blue-100/10 px-3.5 py-1.5 text-xs font-semibold text-blue-100 hover:bg-blue-100 hover:text-richblack-900 transition-all cursor-pointer"
          >
            Sign Up as Student →
          </button>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleOnSubmit} className="flex w-full flex-col gap-y-4">
        <div className="flex gap-x-4">
          {/* First Name */}
          <label>
            <p className="mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5">
              First Name <sup className="text-pink-200">*</sup>
            </p>
            <input
              required
              type="text"
              name="firstName"
              value={firstName}
              onChange={handleOnChange}
              placeholder="Enter first name"
              style={{
                boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
              }}
              className="w-full rounded-[0.5rem] bg-richblack-800 p-[12px] text-richblack-5 outline-none"
            />
          </label>

          {/* Last Name */}
          <label>
            <p className="mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5">
              Last Name <sup className="text-pink-200">*</sup>
            </p>
            <input
              required
              type="text"
              name="lastName"
              value={lastName}
              onChange={handleOnChange}
              placeholder="Enter last name"
              style={{
                boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
              }}
              className="w-full rounded-[0.5rem] bg-richblack-800 p-[12px] text-richblack-5 outline-none"
            />
          </label>
        </div>

        {/* Email Address */}
        <label className="w-full">
          <p className="mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5">
            Email Address <sup className="text-pink-200">*</sup>
          </p>
          <input
            required
            type="text"
            name="email"
            value={email}
            onChange={handleOnChange}
            placeholder="Enter email address"
            style={{
              boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
            }}
            className="w-full rounded-[0.5rem] bg-richblack-800 p-[12px] text-richblack-5 outline-none"
          />
        </label>

        <div className="flex gap-x-4">
          {/* Create Password */}
          <label className="relative">
            <p className="mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5">
              Create Password <sup className="text-pink-200">*</sup>
            </p>
            <input
              required
              type={showPassword ? "text" : "password"}
              name="password"
              value={password}
              onChange={handleOnChange}
              placeholder="Enter Password"
              style={{
                boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
              }}
              className="w-full rounded-[0.5rem] bg-richblack-800 p-[12px] pr-10 text-richblack-5 outline-none"
            />
            <span
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-[38px] z-[10] cursor-pointer"
            >
              {showPassword ? (
                <AiOutlineEyeInvisible fontSize={24} fill="#AFB2BF" />
              ) : (
                <AiOutlineEye fontSize={24} fill="#AFB2BF" />
              )}
            </span>
          </label>

          {/* Confirm Password */}
          <label className="relative">
            <p className="mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5">
              Confirm Password <sup className="text-pink-200">*</sup>
            </p>
            <input
              required
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={confirmPassword}
              onChange={handleOnChange}
              placeholder="Confirm Password"
              style={{
                boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
              }}
              className="w-full rounded-[0.5rem] bg-richblack-800 p-[12px] pr-10 text-richblack-5 outline-none"
            />
            <span
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-3 top-[38px] z-[10] cursor-pointer"
            >
              {showConfirmPassword ? (
                <AiOutlineEyeInvisible fontSize={24} fill="#AFB2BF" />
              ) : (
                <AiOutlineEye fontSize={24} fill="#AFB2BF" />
              )}
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 flex items-center justify-center gap-2 rounded-[8px] bg-yellow-50 py-[10px] px-[12px] font-semibold text-richblack-900 hover:bg-yellow-25 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-richblack-900 border-t-transparent"></div>
              <span>Creating Account...</span>
            </div>
          ) : accountType === ACCOUNT_TYPE.INSTRUCTOR ? (
            "Create Instructor Account"
          ) : (
            "Create Student Account"
          )}
        </button>
      </form>
    </div>
  )
}

export default SignupForm