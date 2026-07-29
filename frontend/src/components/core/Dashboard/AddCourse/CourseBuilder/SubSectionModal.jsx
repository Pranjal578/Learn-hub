import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import { RxCross2 } from "react-icons/rx"
import { MdVideoLibrary, MdQuiz, MdLaunch, MdAdd } from "react-icons/md"
import { useDispatch, useSelector } from "react-redux"

import {
  createSubSection,
  updateSubSection,
} from "../../../../../services/operations/courseDetailsAPI"
import { setCourse } from "../../../../../slices/courseSlice"
import IconBtn from "../../../../common/IconBtn"
import Upload from "../Upload"
import QuizBuilder from "../../../Instructor/QuizBuilder"

export default function SubSectionModal({
  modalData,
  setModalData,
  add = false,
  view = false,
  edit = false,
  isQuizDefault = false,
}) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    getValues,
  } = useForm()

  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [itemType, setItemType] = useState(
    modalData?.isQuiz || isQuizDefault ? "quiz" : "video"
  )
  const [showInteractiveBuilder, setShowInteractiveBuilder] = useState(false)

  const { token } = useSelector((state) => state.auth)
  const { course } = useSelector((state) => state.course)

  useEffect(() => {
    if (view || edit) {
      setValue("lectureTitle", modalData.title || "")
      setValue("lectureDesc", modalData.description || "")
      if (modalData?.isQuiz) {
        setItemType("quiz")
        setValue("quizUrl", modalData.quizUrl || modalData.videoUrl || "")
      } else {
        setItemType("video")
        setValue("lectureVideo", modalData.videoUrl || "")
      }
    } else if (isQuizDefault) {
      setItemType("quiz")
    }
  }, [modalData, view, edit, isQuizDefault, setValue])

  // detect whether form is updated or not
  const isFormUpdated = () => {
    const currentValues = getValues()
    if (
      currentValues.lectureTitle !== modalData.title ||
      currentValues.lectureDesc !== modalData.description ||
      currentValues.lectureVideo !== modalData.videoUrl ||
      currentValues.quizUrl !== modalData.quizUrl ||
      itemType !== (modalData?.isQuiz ? "quiz" : "video")
    ) {
      return true
    }
    return false
  }

  // handle the editing of subsection
  const handleEditSubsection = async () => {
    const currentValues = getValues()
    const formData = new FormData()
    const targetSectionId = modalData.sectionId
    formData.append("sectionId", targetSectionId)
    formData.append("subSectionId", modalData._id)

    if (currentValues.lectureTitle !== modalData.title) {
      formData.append("title", currentValues.lectureTitle)
    }
    if (currentValues.lectureDesc !== modalData.description) {
      formData.append("description", currentValues.lectureDesc)
    }

    formData.append("isQuiz", itemType === "quiz")

    if (itemType === "quiz") {
      formData.append("quizUrl", currentValues.quizUrl || "")
    } else if (currentValues.lectureVideo !== modalData.videoUrl) {
      formData.append("video", currentValues.lectureVideo)
    }

    setLoading(true)
    const result = await updateSubSection(formData, token)
    if (result) {
      const updatedCourseContent = course.courseContent.map((section) =>
        section._id === targetSectionId ? result : section
      )
      const updatedCourse = { ...course, courseContent: updatedCourseContent }
      dispatch(setCourse(updatedCourse))
    }
    setModalData(null)
    setLoading(false)
  }

  const onSubmit = async (data) => {
    if (view) return

    if (edit) {
      if (!isFormUpdated()) {
        toast.error("No changes made to the form")
      } else {
        handleEditSubsection()
      }
      return
    }

    const targetSectionId = typeof modalData === "object" ? modalData.sectionId : modalData

    const formData = new FormData()
    formData.append("sectionId", targetSectionId)
    formData.append("title", data.lectureTitle)
    formData.append("description", data.lectureDesc || "")
    formData.append("isQuiz", itemType === "quiz")

    if (itemType === "quiz") {
      if (!data.quizUrl || !data.quizUrl.trim()) {
        toast.error("Please enter a valid Quiz URL or build an interactive quiz")
        return
      }
      formData.append("quizUrl", data.quizUrl.trim())
    } else {
      if (!data.lectureVideo) {
        toast.error("Please select a video file")
        return
      }
      formData.append("video", data.lectureVideo)
    }

    setLoading(true)
    const result = await createSubSection(formData, token)
    if (result) {
      const updatedCourseContent = course.courseContent.map((section) =>
        section._id === targetSectionId ? result : section
      )
      const updatedCourse = { ...course, courseContent: updatedCourseContent }
      dispatch(setCourse(updatedCourse))
    }
    setModalData(null)
    setLoading(false)
  }

  const handleInteractiveQuizSuccess = async (quizData) => {
    const targetSectionId = typeof modalData === "object" ? modalData.sectionId : modalData
    const quizUrlVal = `/quiz/${quizData._id}`

    if (edit) {
      setValue("quizUrl", quizUrlVal)
      setValue("lectureTitle", quizData.quizName)
      setValue("lectureDesc", `Interactive MCQ Quiz with ${quizData.questions.length} questions.`)
      setShowInteractiveBuilder(false)
      toast.success("Interactive Quiz attached! Click Save Changes to finish.")
      return
    }

    // Create subsection directly linked to created interactive quiz
    const formData = new FormData()
    formData.append("sectionId", targetSectionId)
    formData.append("title", quizData.quizName)
    formData.append("description", `Interactive MCQ Quiz with ${quizData.questions.length} questions.`)
    formData.append("isQuiz", true)
    formData.append("quizUrl", quizUrlVal)

    setLoading(true)
    const result = await createSubSection(formData, token)
    if (result) {
      const updatedCourseContent = course.courseContent.map((section) =>
        section._id === targetSectionId ? result : section
      )
      const updatedCourse = { ...course, courseContent: updatedCourseContent }
      dispatch(setCourse(updatedCourse))
    }
    setModalData(null)
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-[1000] !mt-0 grid h-screen w-screen place-items-center overflow-auto bg-white bg-opacity-10 backdrop-blur-sm">
      <div className="my-10 w-11/12 max-w-[750px] rounded-xl border border-richblack-400 bg-richblack-800 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between rounded-t-xl bg-richblack-700 p-5">
          <p className="text-xl font-semibold text-richblack-5">
            {view && "Viewing"} {add && "Adding"} {edit && "Editing"}{" "}
            {itemType === "quiz" ? "Quiz / Assessment" : "Lecture"}
          </p>
          <button onClick={() => (!loading ? setModalData(null) : {})}>
            <RxCross2 className="text-2xl text-richblack-5" />
          </button>
        </div>

        {showInteractiveBuilder ? (
          <div className="p-6">
            <QuizBuilder
              courseId={course?._id}
              token={token}
              onSuccess={handleInteractiveQuizSuccess}
              onCancel={() => setShowInteractiveBuilder(false)}
            />
          </div>
        ) : (
          <>
            {/* Item Type Selector Tabs (Add / Edit mode) */}
            {!view && (
              <div className="flex border-b border-richblack-700 bg-richblack-900 px-8 pt-4">
                <button
                  type="button"
                  onClick={() => setItemType("video")}
                  className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
                    itemType === "video"
                      ? "border-yellow-50 text-yellow-50"
                      : "border-transparent text-richblack-300 hover:text-richblack-5"
                  }`}
                >
                  <MdVideoLibrary size={18} /> Video Lecture
                </button>

                <button
                  type="button"
                  onClick={() => setItemType("quiz")}
                  className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
                    itemType === "quiz"
                      ? "border-yellow-50 text-yellow-50"
                      : "border-transparent text-richblack-300 hover:text-richblack-5"
                  }`}
                >
                  <MdQuiz size={18} /> Quiz / Assessment
                </button>
              </div>
            )}

            {/* Modal Form */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6 px-8 py-8"
            >
              {/* VIDEO MODE: Upload File */}
              {itemType === "video" && (
                <Upload
                  name="lectureVideo"
                  label="Lecture Video"
                  register={register}
                  setValue={setValue}
                  errors={errors}
                  video={true}
                  viewData={view ? modalData.videoUrl : null}
                  editData={edit ? modalData.videoUrl : null}
                />
              )}

              {/* QUIZ MODE: Form Link & Interactive Builder */}
              {itemType === "quiz" && (
                <div className="space-y-4">
                  {!view && (
                    <div className="p-4 bg-richblack-900 rounded-xl border border-richblack-700 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold text-yellow-50">
                          ✨ Native Interactive MCQ Quiz Builder
                        </p>
                        <p className="text-[11px] text-richblack-300">
                          Build a dynamic quiz with 3-5 options per question and auto-evaluation.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowInteractiveBuilder(true)}
                        className="flex items-center gap-1.5 bg-yellow-50 text-richblack-900 text-xs font-bold px-4 py-2 rounded-lg hover:bg-yellow-25 shadow transition shrink-0"
                      >
                        <MdAdd size={16} /> Build Interactive MCQ Quiz
                      </button>
                    </div>
                  )}

                  <div className="rounded-xl border border-richblack-700 bg-richblack-900 p-4">
                    <p className="text-xs font-semibold text-yellow-50 flex items-center gap-1.5 mb-1">
                      💡 External Quiz Links
                    </p>
                    <p className="text-xs text-richblack-300">
                      Or embed an external quiz link (Google Forms, Quizizz, Microsoft Forms).
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 border-t border-richblack-800">
                      <span className="text-[11px] text-richblack-400 font-medium">Free Builders:</span>
                      <a
                        href="https://forms.new"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 bg-yellow-50/10 hover:bg-yellow-50/20 text-yellow-50 border border-yellow-50/30 text-xs px-2.5 py-1 rounded-md transition"
                      >
                        <MdLaunch size={12} /> Google Forms
                      </a>
                      <a
                        href="https://forms.office.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs px-2.5 py-1 rounded-md transition"
                      >
                        <MdLaunch size={12} /> MS Forms
                      </a>
                      <a
                        href="https://quizizz.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 bg-caribbeangreen-500/10 hover:bg-caribbeangreen-500/20 text-caribbeangreen-300 border border-caribbeangreen-500/30 text-xs px-2.5 py-1 rounded-md transition"
                      >
                        <MdLaunch size={12} /> Quizizz
                      </a>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <label className="text-sm text-richblack-5" htmlFor="quizUrl">
                      Quiz / Form URL {!view && <sup className="text-pink-200">*</sup>}
                    </label>
                    <input
                      disabled={view || loading}
                      id="quizUrl"
                      type="text"
                      placeholder="https://... or /quiz/..."
                      {...register("quizUrl", { required: itemType === "quiz" })}
                      className="form-style w-full font-mono text-xs"
                    />
                    {errors.quizUrl && (
                      <span className="ml-2 text-xs tracking-wide text-pink-200">
                        Quiz URL is required
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Title */}
              <div className="flex flex-col space-y-2">
                <label className="text-sm text-richblack-5" htmlFor="lectureTitle">
                  {itemType === "quiz" ? "Quiz Title" : "Lecture Title"}{" "}
                  {!view && <sup className="text-pink-200">*</sup>}
                </label>
                <input
                  disabled={view || loading}
                  id="lectureTitle"
                  placeholder={
                    itemType === "quiz"
                      ? "Enter Quiz Title (e.g. Chapter 1 Quiz)"
                      : "Enter Lecture Title"
                  }
                  {...register("lectureTitle", { required: true })}
                  className="form-style w-full"
                />
                {errors.lectureTitle && (
                  <span className="ml-2 text-xs tracking-wide text-pink-200">
                    Title is required
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="flex flex-col space-y-2">
                <label className="text-sm text-richblack-5" htmlFor="lectureDesc">
                  {itemType === "quiz" ? "Quiz Description" : "Lecture Description"}{" "}
                  {!view && <sup className="text-pink-200">*</sup>}
                </label>
                <textarea
                  disabled={view || loading}
                  id="lectureDesc"
                  placeholder={
                    itemType === "quiz"
                      ? "Instructions for students taking this quiz"
                      : "Enter Lecture Description"
                  }
                  {...register("lectureDesc", { required: true })}
                  className="form-style resize-x-none min-h-[110px] w-full"
                />
                {errors.lectureDesc && (
                  <span className="ml-2 text-xs tracking-wide text-pink-200">
                    Description is required
                  </span>
                )}
              </div>

              {!view && (
                <div className="flex justify-end">
                  <IconBtn
                    disabled={loading}
                    text={
                      loading
                        ? "Loading.."
                        : edit
                        ? "Save Changes"
                        : itemType === "quiz"
                        ? "Publish Quiz"
                        : "Save Lecture"
                    }
                  />
                </div>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  )
}