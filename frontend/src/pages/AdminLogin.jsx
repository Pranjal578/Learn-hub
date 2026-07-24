import { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { MdAdminPanelSettings } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Navigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { apiConnector } from "../services/apiConnector";
import { adminEndpoints } from "../services/apis";
import { setLoading, setToken } from "../slices/authSlice";
import { setUser } from "../slices/profileSlice";

// ── Inlined admin login thunk (avoids a separate file for a single-use operation)
function adminLogin(email, password, navigate) {
  return async (dispatch) => {
    const toastId = toast.loading("Authenticating...");
    dispatch(setLoading(true));
    try {
      const response = await apiConnector(
        "POST",
        adminEndpoints.ADMIN_LOGIN_API,
        { email, password }
      );
      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      toast.success("Welcome, Super Admin!");
      dispatch(setToken(response.data.token));

      const userImage = response.data?.user?.image
        ? response.data.user.image
        : `https://api.dicebear.com/5.x/initials/svg?seed=${response.data.user.firstName} ${response.data.user.lastName}`;

      dispatch(setUser({ ...response.data.user, image: userImage }));
      localStorage.setItem("token", JSON.stringify(response.data.token));
      localStorage.setItem(
        "user",
        JSON.stringify({ ...response.data.user, image: userImage })
      );
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("ADMIN LOGIN ERROR:", error);
      toast.error(
        error?.response?.data?.message || "Admin authentication failed"
      );
    } finally {
      dispatch(setLoading(false));
      toast.dismiss(toastId);
    }
  };
}

// ── Login Form ──
function AdminLoginForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(adminLogin(formData.email, formData.password, navigate));
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex w-full flex-col gap-y-4">
      <label className="w-full">
        <p className="mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5">
          Admin Email <sup className="text-pink-200">*</sup>
        </p>
        <input
          required
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter admin email"
          className="w-full rounded-[0.5rem] bg-richblack-700 p-[12px] text-richblack-5 border border-richblack-600 focus:outline-none focus:border-yellow-50"
        />
      </label>

      <label className="relative w-full">
        <p className="mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5">
          Password <sup className="text-pink-200">*</sup>
        </p>
        <input
          required
          type={showPassword ? "text" : "password"}
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter password"
          className="w-full rounded-[0.5rem] bg-richblack-700 p-[12px] pr-10 text-richblack-5 border border-richblack-600 focus:outline-none focus:border-yellow-50"
        />
        <span
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-[38px] z-[10] cursor-pointer text-richblack-300 hover:text-richblack-5"
        >
          {showPassword ? (
            <AiOutlineEyeInvisible size={22} />
          ) : (
            <AiOutlineEye size={22} />
          )}
        </span>
      </label>

      <button
        type="submit"
        disabled={loading}
        className="mt-4 flex items-center justify-center gap-2 rounded-[8px] bg-yellow-50 py-[12px] px-[12px] font-medium text-richblack-900 hover:bg-yellow-100 transition-all disabled:opacity-50"
      >
        <MdAdminPanelSettings size={20} />
        {loading ? "Authenticating..." : "Access Admin Console"}
      </button>
    </form>
  );
}

// ── Page ──
function AdminLogin() {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);

  if (token !== null && user?.accountType === "Admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
      <div className="mx-auto flex w-11/12 max-w-maxContent flex-col items-center justify-center gap-y-8 py-12">
        {/* Header badge */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-richblack-800 border border-richblack-600 shadow-lg">
            <MdAdminPanelSettings className="text-yellow-50" size={36} />
          </div>
          <div className="text-center">
            <h1 className="text-[1.875rem] font-semibold leading-[2.375rem] text-richblack-5">
              Admin Secure Portal
            </h1>
            <p className="mt-2 text-sm text-richblack-300">
              This portal is restricted to Super Administrators only.
            </p>
          </div>
        </div>

        {/* Form card */}
        <div className="w-full max-w-[420px] rounded-2xl border border-richblack-700 bg-richblack-800 p-8 shadow-xl">
          <AdminLoginForm />
        </div>

        {/* Footer note */}
        <p className="text-xs text-richblack-500">
          Regular users should use{" "}
          <a href="/login" className="text-yellow-50 hover:underline">
            the standard login page
          </a>
          .
        </p>
      </div>
    </div>
  );
}

export default AdminLogin;
