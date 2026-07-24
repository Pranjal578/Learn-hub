import { toast } from "react-hot-toast";
import { apiConnector } from "../apiConnector";
import { adminEndpoints } from "../apis";
import { setLoading, setToken } from "../../slices/authSlice";
import { setUser } from "../../slices/profileSlice";

const { ADMIN_LOGIN_API } = adminEndpoints;

// ================ Admin Login ================
export function adminLogin(email, password, navigate) {
  return async (dispatch) => {
    const toastId = toast.loading("Authenticating...");
    dispatch(setLoading(true));
    try {
      const response = await apiConnector("POST", ADMIN_LOGIN_API, { email, password });

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
      localStorage.setItem("user", JSON.stringify({ ...response.data.user, image: userImage }));

      navigate("/admin/dashboard");
    } catch (error) {
      console.error("ADMIN LOGIN ERROR:", error);
      toast.error(error?.response?.data?.message || "Admin authentication failed");
    } finally {
      dispatch(setLoading(false));
      toast.dismiss(toastId);
    }
  };
}
