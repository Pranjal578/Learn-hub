// AdminRoute: Only allows users with accountType === "Admin"
// Redirects everyone else back to the home page
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { ACCOUNT_TYPE } from "../../../utils/constants";

function AdminRoute({ children }) {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);

  if (token !== null && user?.accountType === ACCOUNT_TYPE.ADMIN) {
    return children;
  }

  // Not logged in or not an admin — send to admin login
  return <Navigate to="/admin/login" />;
}

export default AdminRoute;
