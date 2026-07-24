import { useLocation } from "react-router-dom"
import signupImg from "../assets/Images/signup.png"
import Template from "../components/core/Auth/Template"

function Signup() {
  const location = useLocation()
  const isInstructor = location.pathname.includes("/signup/instructor")

  return (
    <Template
      title={
        isInstructor
          ? "Join LearnHub as an Instructor & Teach Worldwide"
          : "Join millions learning on LearnHub for free"
      }
      description1={
        isInstructor
          ? "Share your knowledge, inspire students, and earn."
          : "Build skills for today, tomorrow, and beyond."
      }
      description2={
        isInstructor
          ? "Education to empower future generations."
          : "Education to future-proof your career."
      }
      image={signupImg}
      formType="signup"
    />
  )
}

export default Signup