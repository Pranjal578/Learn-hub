import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { RiDeleteBin6Line } from 'react-icons/ri'

export default function RequirementsField({ name, label, register, setValue, errors }) {
  const { editCourse, course } = useSelector((state) => state.course)
  const [requirement, setRequirement] = useState("")
  const [requirementsList, setRequirementsList] = useState([])

  useEffect(() => {
    if (editCourse && course?.instructions) {
      setRequirementsList(Array.isArray(course.instructions) ? course.instructions : [course.instructions])
    }
    register(name, { required: false })
  }, [])

  useEffect(() => {
    if (requirementsList.length === 0 && !requirement.trim()) {
      setValue(name, ["Basic understanding of the topic"])
    } else if (requirementsList.length === 0 && requirement.trim()) {
      setValue(name, [requirement.trim()])
    } else {
      setValue(name, requirementsList)
    }
  }, [requirementsList, requirement])

  const handleAddRequirement = () => {
    if (requirement.trim() && !requirementsList.includes(requirement.trim())) {
      setRequirementsList([...requirementsList, requirement.trim()])
      setRequirement("")
    }
  }

  const handleBlur = () => {
    if (requirement.trim() && !requirementsList.includes(requirement.trim())) {
      setRequirementsList([...requirementsList, requirement.trim()])
      setRequirement("")
    }
  }

  const handleRemoveRequirement = (index) => {
    const updatedRequirements = [...requirementsList]
    updatedRequirements.splice(index, 1)
    setRequirementsList(updatedRequirements)
  }

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm text-richblack-5" htmlFor={name}>
        {label} <span className="text-xs text-richblack-400">(Type requirement and click Add or blur)</span>
      </label>

      <div className="flex flex-col items-start space-y-2">
        <div className="flex w-full gap-2">
          <input
            type="text"
            id={name}
            value={requirement}
            onChange={(e) => setRequirement(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleAddRequirement()
              }
            }}
            placeholder="e.g. Basic computer knowledge"
            className="form-style w-full"
          />
          <button
            type="button"
            onClick={handleAddRequirement}
            className="rounded-lg bg-yellow-50 px-4 py-2 font-semibold text-richblack-900 hover:bg-yellow-25"
          >
            Add
          </button>
        </div>

        {requirementsList.length > 0 && (
          <ul className="mt-2 space-y-1 w-full">
            {requirementsList.map((req, index) => (
              <li key={index} className="flex items-center justify-between rounded-md bg-richblack-700 px-3 py-1.5 text-xs text-richblack-5">
                <span>• {req}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveRequirement(index)}
                  className="text-pink-200 hover:text-pink-100 ml-2"
                >
                  <RiDeleteBin6Line size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}