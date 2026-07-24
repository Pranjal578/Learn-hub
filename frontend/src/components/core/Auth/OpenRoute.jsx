// This will prevent authenticated users from accessing this route
import { useSelector } from "react-redux"
import { Navigate } from "react-router-dom"
import { ACCOUNT_TYPE } from "../../../utils/constants"

function OpenRoute({ children }) {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)

  if (token === null) {
    return children
  } else {
    if (user?.accountType === ACCOUNT_TYPE.INSTRUCTOR) {
      return <Navigate to="/dashboard/instructor" />
    } else if (user?.accountType === ACCOUNT_TYPE.ADMIN) {
      return <Navigate to="/admin/dashboard" />
    } else {
      return <Navigate to="/dashboard/student" />
    }
  }
}

export default OpenRoute