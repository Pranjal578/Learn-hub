import { useEffect, useState } from "react"
import { MdClose } from "react-icons/md"
import { useSelector } from "react-redux"

export default function ChipInput({ label, name, placeholder, register, errors, setValue }) {
  const { editCourse, course } = useSelector((state) => state.course)
  const [chips, setChips] = useState([])
  const [inputValue, setInputValue] = useState("")

  useEffect(() => {
    if (editCourse && course?.tag) {
      setChips(Array.isArray(course.tag) ? course.tag : [course.tag])
    }
    register(name, { required: false })
  }, [])

  useEffect(() => {
    if (chips.length === 0 && !inputValue.trim()) {
      setValue(name, ["General"])
    } else if (chips.length === 0 && inputValue.trim()) {
      setValue(name, [inputValue.trim()])
    } else {
      setValue(name, chips)
    }
  }, [chips, inputValue])

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault()
      const chipValue = event.target.value.trim()
      if (chipValue && !chips.includes(chipValue)) {
        setChips([...chips, chipValue])
        setInputValue("")
      }
    }
  }

  const handleBlur = (event) => {
    const chipValue = event.target.value.trim()
    if (chipValue && !chips.includes(chipValue)) {
      setChips([...chips, chipValue])
      setInputValue("")
    }
  }

  const handleDeleteChip = (chipIndex) => {
    const newChips = chips.filter((_, index) => index !== chipIndex)
    setChips(newChips)
  }

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm text-richblack-5" htmlFor={name}>
        {label} <span className="text-xs text-richblack-400">(Press Enter or Comma to add tags)</span>
      </label>

      <div className="flex w-full flex-wrap gap-y-2">
        {chips.map((chip, index) => (
          <div
            key={index}
            className="m-1 flex items-center rounded-full bg-yellow-400 px-2 py-1 text-sm text-richblack-900"
          >
            <span>{chip}</span>
            <button
              type="button"
              className="ml-2 focus:outline-none"
              onClick={() => handleDeleteChip(index)}
            >
              <MdClose className="text-sm" />
            </button>
          </div>
        ))}

        <input
          id={name}
          name={name}
          type="text"
          placeholder={placeholder || "Enter a tag (e.g. React, WebDev)"}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className="form-style w-full"
        />
      </div>
    </div>
  )
}