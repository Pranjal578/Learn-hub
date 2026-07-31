import React, { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useLocation, useNavigate, useParams } from "react-router-dom"

import "video-react/dist/video-react.css"
import { BigPlayButton, Player } from "video-react"

import { markLectureAsComplete } from "../../../services/operations/courseDetailsAPI"
import { updateCompletedLectures } from "../../../slices/viewCourseSlice"
import { setCourseViewSidebar } from "../../../slices/sidebarSlice"
import { fetchQuizById, fetchQuizBySubSection } from "../../../services/operations/quizAPI"

import IconBtn from "../../common/IconBtn"
import StudentQuizView from "../Student/StudentQuizView"

import { HiMenuAlt1 } from 'react-icons/hi'
import { MdQuiz, MdLaunch, MdCheckCircle } from 'react-icons/md'

const VideoDetails = () => {
  const { courseId, sectionId, subSectionId } = useParams()

  const navigate = useNavigate()
  const location = useLocation()
  const playerRef = useRef(null)
  const dispatch = useDispatch()

  const { token } = useSelector((state) => state.auth)
  const { courseSectionData, courseEntireData, completedLectures } = useSelector((state) => state.viewCourse)

  const [videoData, setVideoData] = useState(null)
  const [interactiveQuiz, setInteractiveQuiz] = useState(null)
  const [quizFetchDone, setQuizFetchDone] = useState(false)   // true once quiz API call resolves
  const [previewSource, setPreviewSource] = useState("")
  const [videoEnded, setVideoEnded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [quizStarted, setQuizStarted] = useState(false)   // gate: show quiz only after clicking Start Quiz

  // Track whether course data has started loading (non-empty section data received at least once)
  const [courseLoaded, setCourseLoaded] = useState(false)

  // Prevent infinite refresh loops — reset whenever the subSectionId changes
  const refreshAttemptedRef = React.useRef(false)
  useEffect(() => {
    refreshAttemptedRef.current = false
  }, [subSectionId])

  useEffect(() => {
    ; (async () => {
      if (!courseSectionData.length) return  // still waiting for data
      setCourseLoaded(true)
      if (!courseId && !sectionId && !subSectionId) {
        navigate(`/dashboard/enrolled-courses`)
      } else {
        const filteredData = courseSectionData.filter(
          (course) => course._id === sectionId
        )
        const filteredVideoData = filteredData?.[0]?.subSection.filter(
          (data) => data._id === subSectionId
        )
        const targetSub = filteredVideoData?.[0] || null

        // If the subsection isn't in Redux yet (e.g. newly created lecture),
        // fire a refresh event so ViewCourse re-fetches — but only once per nav
        if (!targetSub && subSectionId && !refreshAttemptedRef.current) {
          refreshAttemptedRef.current = true
          window.dispatchEvent(new Event('course:refresh'))
          return  // wait for re-render with fresh data
        }

        setVideoData(targetSub)
        setPreviewSource(courseEntireData.thumbnail)
        setVideoEnded(false)
        setQuizStarted(false)   // reset quiz gate when navigating to a new subsection
        setInteractiveQuiz(null)
        setQuizFetchDone(false)

        // Older quizzes store only `/quiz/<id>` in quizUrl. Support those
        // records as native quizzes as well as newly linked quizId records.
        const localQuizMatch = targetSub?.quizUrl?.match(/^\/quiz\/([^/?#]+)$/)
        const nativeQuizId = targetSub?.quizId || localQuizMatch?.[1]
        if (targetSub && nativeQuizId) {
          const quizObj = targetSub.quizId
            ? await fetchQuizBySubSection(targetSub._id, token)
            : await fetchQuizById(nativeQuizId, token)
          setInteractiveQuiz(quizObj || null)
          setQuizFetchDone(true)
        } else {
          setInteractiveQuiz(null)
          setQuizFetchDone(true)
        }
      }
    })()
  }, [courseSectionData, courseEntireData, location.pathname])

  // check if the lecture is the first video of the course
  const isFirstVideo = () => {
    const currentSectionIndx = courseSectionData.findIndex((data) => data._id === sectionId)
    const currentSubSectionIndx = courseSectionData[currentSectionIndx]?.subSection.findIndex((data) => data._id === subSectionId)

    if (currentSectionIndx === 0 && currentSubSectionIndx === 0) {
      return true
    } else {
      return false
    }
  }

  // go to the next video
  const goToNextVideo = () => {
    const currentSectionIndx = courseSectionData.findIndex((data) => data._id === sectionId)
    const noOfSubsections = courseSectionData[currentSectionIndx]?.subSection.length
    const currentSubSectionIndx = courseSectionData[currentSectionIndx]?.subSection.findIndex((data) => data._id === subSectionId)

    if (currentSubSectionIndx !== noOfSubsections - 1) {
      const nextSubSectionId = courseSectionData[currentSectionIndx].subSection[currentSubSectionIndx + 1]._id
      navigate(`/view-course/${courseId}/section/${sectionId}/sub-section/${nextSubSectionId}`)
    } else {
      const nextSectionId = courseSectionData[currentSectionIndx + 1]._id
      const nextSubSectionId = courseSectionData[currentSectionIndx + 1].subSection[0]._id
      navigate(`/view-course/${courseId}/section/${nextSectionId}/sub-section/${nextSubSectionId}`)
    }
  }

  // check if the lecture is the last video of the course
  const isLastVideo = () => {
    const currentSectionIndx = courseSectionData.findIndex((data) => data._id === sectionId)
    const noOfSubsections = courseSectionData[currentSectionIndx]?.subSection.length
    const currentSubSectionIndx = courseSectionData[
      currentSectionIndx
    ]?.subSection.findIndex((data) => data._id === subSectionId)

    if (
      currentSectionIndx === courseSectionData.length - 1 &&
      currentSubSectionIndx === noOfSubsections - 1
    ) {
      return true
    } else {
      return false
    }
  }

  // go to the previous video
  const goToPrevVideo = () => {
    const currentSectionIndx = courseSectionData.findIndex((data) => data._id === sectionId)
    const currentSubSectionIndx = courseSectionData[
      currentSectionIndx
    ]?.subSection.findIndex((data) => data._id === subSectionId)

    if (currentSubSectionIndx !== 0) {
      const prevSubSectionId = courseSectionData[currentSectionIndx].subSection[currentSubSectionIndx - 1]._id
      navigate(
        `/view-course/${courseId}/section/${sectionId}/sub-section/${prevSubSectionId}`
      )
    } else {
      const prevSectionId = courseSectionData[currentSectionIndx - 1]._id
      const prevSubSectionLength = courseSectionData[currentSectionIndx - 1].subSection.length
      const prevSubSectionId = courseSectionData[currentSectionIndx - 1].subSection[prevSubSectionLength - 1]._id
      navigate(
        `/view-course/${courseId}/section/${prevSectionId}/sub-section/${prevSubSectionId}`
      )
    }
  }

  // handle Lecture Completion
  const handleLectureCompletion = async () => {
    setLoading(true)
    const res = await markLectureAsComplete(
      { courseId: courseId, subsectionId: subSectionId },
      token
    )
    if (res) {
      dispatch(updateCompletedLectures(subSectionId))
    }
    setLoading(false)
  }

  const handleInteractiveQuizSubmitted = async () => {
    // Automatically mark lecture as complete when student submits interactive quiz
    if (!completedLectures.includes(subSectionId)) {
      await handleLectureCompletion()
    }
  }

  const { courseViewSidebar } = useSelector(state => state.sidebar)

  if (courseViewSidebar && window.innerWidth <= 640) return null;

  // Determine what type of content this subsection is:
  // 1. Native interactive MCQ quiz  → quizId present on subsection (created via platform quiz builder)
  // 2. External quiz form/link      → isQuiz=true + quizUrl is an http link + no platform quizId
  // 3. Regular video lecture        → default (isQuiz=false)
  //
  // IMPORTANT: Some existing DB records have quizUrl = videoUrl (Cloudinary) for regular lectures.
  // The ONLY reliable flag is `isQuiz`. Never use quizUrl alone to determine quiz status.
  const localQuizMatch = videoData?.quizUrl?.match(/^\/quiz\/([^/?#]+)$/)
  const nativeQuizId = videoData?.quizId || localQuizMatch?.[1]
  const hasNativeQuiz  = Boolean(interactiveQuiz)                                          // quiz data loaded from API
  const isQuizLoading  = Boolean(nativeQuizId) && !quizFetchDone                           // quiz API call in flight
  const isQuizFailed   = Boolean(nativeQuizId) && quizFetchDone && !interactiveQuiz        // API done but quiz not found
  const isExternalQuiz = videoData?.isQuiz && !nativeQuizId &&                             // marked as quiz but no platform quiz
    videoData?.quizUrl?.startsWith('http')                                                 // and has a real external http link
  const isQuizItem = hasNativeQuiz || isQuizLoading || isQuizFailed || isExternalQuiz

  const quizLink = isExternalQuiz && videoData?.quizUrl?.startsWith('http')
    ? videoData.quizUrl
    : null
  const isCompleted = completedLectures.includes(subSectionId)


  return (
    <div className="flex flex-col gap-5 text-white">

      {/* open - close side bar icons */}
      <div className="sm:hidden text-white absolute left-7 top-3 cursor-pointer " onClick={() => dispatch(setCourseViewSidebar(!courseViewSidebar))}>
        {
          !courseViewSidebar && <HiMenuAlt1 size={33} />
        }
      </div>

      {hasNativeQuiz ? (
        /* ── NATIVE INTERACTIVE MCQ QUIZ VIEW ── */
        <div className="space-y-4">
          {!quizStarted ? (
            /* Quiz intro card — shown before student starts */
            <div className="my-4 flex flex-col gap-6 rounded-2xl border border-richblack-700 bg-richblack-800 p-8 shadow-xl">
              <div className="flex items-center gap-3 border-b border-richblack-700 pb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-50/10 text-yellow-50">
                  <MdQuiz size={28} />
                </div>
                <div>
                  <span className="text-xs font-bold text-yellow-50 uppercase tracking-widest bg-yellow-50/10 px-2.5 py-0.5 rounded-full border border-yellow-50/20">
                    Interactive Quiz
                  </span>
                  <h2 className="text-2xl font-bold text-richblack-5 mt-1">{interactiveQuiz?.quizName || videoData?.title}</h2>
                </div>
              </div>

              <p className="text-sm text-richblack-300 leading-relaxed">
                {videoData?.description || "Test your knowledge with this interactive quiz. Answer all questions and submit when ready."}
              </p>

              <div className="flex items-center gap-4 text-sm text-richblack-300">
                <span className="flex items-center gap-1.5 bg-richblack-700 px-3 py-1.5 rounded-lg">
                  📋 {interactiveQuiz?.questions?.length || 0} Questions
                </span>
                {isCompleted && (
                  <div className="flex items-center gap-1.5 rounded-full bg-caribbeangreen-500/20 px-3 py-1 text-xs font-bold text-caribbeangreen-300 border border-caribbeangreen-500/30">
                    <MdCheckCircle size={16} /> Completed
                  </div>
                )}
              </div>

              {interactiveQuiz?.hasSubmitted ? (
                /* Already submitted — show review button */
                <button
                  onClick={() => setQuizStarted(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-caribbeangreen-500 bg-caribbeangreen-500/20 px-6 py-3 text-sm font-bold text-caribbeangreen-300 hover:bg-caribbeangreen-500/30 shadow-lg transition"
                >
                  <MdCheckCircle size={18} /> Review Submission
                </button>
              ) : (
                /* Not yet submitted — show start quiz button */
                <button
                  onClick={() => setQuizStarted(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-50 px-6 py-3 text-sm font-bold text-richblack-900 hover:bg-yellow-25 shadow-lg transition"
                >
                  <MdQuiz size={18} /> Start Quiz
                </button>
              )}
            </div>
          ) : (
            <StudentQuizView
              quiz={interactiveQuiz}
              token={token}
              onSubmitted={handleInteractiveQuizSubmitted}
              onClose={() => setQuizStarted(false)}
            />
          )}

          <div className="flex items-center justify-between border-t border-richblack-700 pt-6 mt-4">
            {!isFirstVideo() ? (
              <button
                disabled={loading}
                onClick={goToPrevVideo}
                className="rounded-lg bg-richblack-700 px-5 py-2 text-sm font-semibold text-richblack-100 hover:bg-richblack-600 transition"
              >
                ← Previous Item
              </button>
            ) : <div />}

            {!isLastVideo() ? (
              <button
                disabled={loading}
                onClick={goToNextVideo}
                className="rounded-lg bg-yellow-50 px-5 py-2 text-sm font-bold text-richblack-900 hover:bg-yellow-25 transition"
              >
                Next Item →
              </button>
            ) : <div />}
          </div>
        </div>

      ) : isQuizLoading ? (
        /* ── NATIVE QUIZ: API call in flight ── */
        <div className="my-4 flex flex-col items-center justify-center gap-4 rounded-2xl border border-richblack-700 bg-richblack-800 p-10 shadow-xl">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-richblack-600 border-t-yellow-50" />
          <p className="text-richblack-300 text-sm">Loading quiz...</p>
        </div>

      ) : isQuizFailed ? (
        /* ── NATIVE QUIZ: fetch failed / quiz not found ── */
        <div className="my-4 flex flex-col items-center justify-center gap-4 rounded-2xl border border-pink-700/40 bg-richblack-800 p-10 shadow-xl">
          <span className="text-4xl">📋</span>
          <p className="text-richblack-100 font-semibold">Quiz Not Available</p>
          <p className="text-richblack-400 text-sm text-center">The quiz for this lecture could not be loaded. Please contact your instructor.</p>
          <div className="flex items-center justify-between w-full pt-4 border-t border-richblack-700">
            {!isFirstVideo() ? (
              <button disabled={loading} onClick={goToPrevVideo}
                className="rounded-lg bg-richblack-700 px-5 py-2 text-sm font-semibold text-richblack-100 hover:bg-richblack-600 transition">
                ← Previous Item
              </button>
            ) : <div />}
            {!isLastVideo() ? (
              <button disabled={loading} onClick={goToNextVideo}
                className="rounded-lg bg-yellow-50 px-5 py-2 text-sm font-bold text-richblack-900 hover:bg-yellow-25 transition">
                Next Item →
              </button>
            ) : <div />}
          </div>
        </div>

      ) : isExternalQuiz ? (
        /* ── EXTERNAL QUIZ FORM LINK VIEW ── */
        <div className="my-4 flex flex-col gap-6 rounded-2xl border border-richblack-700 bg-richblack-800 p-8 shadow-xl">
          <div className="flex items-center justify-between border-b border-richblack-700 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-50/10 text-yellow-50">
                <MdQuiz size={28} />
              </div>
              <div>
                <span className="text-xs font-bold text-yellow-50 uppercase tracking-widest bg-yellow-50/10 px-2.5 py-0.5 rounded-full border border-yellow-50/20">
                  Course Quiz & Assessment
                </span>
                <h2 className="text-2xl font-bold text-richblack-5 mt-1">{videoData?.title}</h2>
              </div>
            </div>

            {isCompleted && (
              <div className="flex items-center gap-1.5 rounded-full bg-caribbeangreen-500/20 px-3 py-1 text-xs font-bold text-caribbeangreen-300 border border-caribbeangreen-500/30">
                <MdCheckCircle size={16} /> Completed
              </div>
            )}
          </div>

          <p className="text-sm text-richblack-300 leading-relaxed">
            {videoData?.description || "Complete this quiz assessment to test your knowledge and progress through the course."}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            {quizLink && (
              <a
                href={quizLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-yellow-50 px-6 py-3 text-sm font-bold text-richblack-900 hover:bg-yellow-25 shadow-lg transition"
              >
                <MdLaunch size={18} /> Open Quiz Form
              </a>
            )}

            {!isCompleted && (
              <button
                disabled={loading}
                onClick={handleLectureCompletion}
                className="inline-flex items-center gap-2 rounded-xl border border-caribbeangreen-500 bg-caribbeangreen-500/20 px-6 py-3 text-sm font-bold text-caribbeangreen-300 hover:bg-caribbeangreen-500/30 transition disabled:opacity-50"
              >
                <MdCheckCircle size={18} />
                {loading ? "Saving..." : "Mark Quiz as Completed"}
              </button>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-richblack-700 pt-6 mt-4">
            {!isFirstVideo() ? (
              <button
                disabled={loading}
                onClick={goToPrevVideo}
                className="rounded-lg bg-richblack-700 px-5 py-2 text-sm font-semibold text-richblack-100 hover:bg-richblack-600 transition"
              >
                ← Previous Item
              </button>
            ) : <div />}

            {!isLastVideo() ? (
              <button
                disabled={loading}
                onClick={goToNextVideo}
                className="rounded-lg bg-yellow-50 px-5 py-2 text-sm font-bold text-richblack-900 hover:bg-yellow-25 transition"
              >
                Next Item →
              </button>
            ) : <div />}
          </div>
        </div>

      ) : !videoData ? (
        /* ── LOADING / PREVIEW STATE ── */
        courseLoaded ? (
          subSectionId ? (
            // Course data loaded but no matching subsection found — show placeholder
            <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-richblack-800 border border-richblack-700">
              <div className="flex flex-col items-center gap-3 text-center px-6">
                <p className="text-lg font-semibold text-richblack-100">Content not available</p>
                <p className="text-sm text-richblack-400">This lecture could not be loaded. It might have been recently updated or removed.</p>
              </div>
            </div>
          ) : (
            // No subsection selected yet, show course thumbnail
            <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-richblack-800">
              <img src={previewSource} alt="Course Thumbnail" className="h-full w-full rounded-md object-cover" />
            </div>
          )
        ) : (
          // Course data still loading — show a spinner
          <div className="flex h-64 w-full items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-richblack-400">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-richblack-600 border-t-yellow-50" />
              <p className="text-sm">Loading course content...</p>
            </div>
          </div>
        )
      ) : !videoData?.videoUrl ? (
        /* ── NO VIDEO URL — show placeholder ── */
        <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-richblack-800 border border-richblack-700">
          <div className="flex flex-col items-center gap-3 text-center px-6">
            <span className="text-5xl">🎬</span>
            <p className="text-lg font-semibold text-richblack-100">No video uploaded yet</p>
            <p className="text-sm text-richblack-400">The instructor hasn't added a video for this lecture.</p>
          </div>
        </div>
      ) : (
        /* ── VIDEO LECTURE PLAYER VIEW ── */
        <Player
          key={videoData?.videoUrl}
          ref={playerRef}
          aspectRatio="16:9"
          playsInline
          autoPlay
          onEnded={() => setVideoEnded(true)}
          src={videoData?.videoUrl}
        >
          <BigPlayButton position="center" />
          {/* Overlay shown when video ends */}
          {videoEnded && (
            <div
              style={{
                backgroundImage:
                  "linear-gradient(to top, rgb(0, 0, 0), rgba(0,0,0,0.7), rgba(0,0,0,0.5), rgba(0,0,0,0.1)",
              }}
              className="full absolute inset-0 z-[100] grid h-full place-content-center font-inter"
            >
              {!completedLectures.includes(subSectionId) && (
                <IconBtn
                  disabled={loading}
                  onclick={() => handleLectureCompletion()}
                  text={!loading ? "Mark As Completed" : "Loading..."}
                  customClasses="text-xl max-w-max px-4 mx-auto"
                />
              )}
              <IconBtn
                disabled={loading}
                onclick={() => {
                  if (playerRef?.current) {
                    playerRef?.current?.seek(0)
                    setVideoEnded(false)
                  }
                }}
                text="Rewatch"
                customClasses="text-xl max-w-max px-4 mx-auto mt-2"
              />

              <div className="mt-10 flex min-w-[250px] justify-center gap-x-4 text-xl">
                {!isFirstVideo() && (
                  <button
                    disabled={loading}
                    onClick={goToPrevVideo}
                    className="blackButton"
                  >
                    Prev
                  </button>
                )}
                {!isLastVideo() && (
                  <button
                    disabled={loading}
                    onClick={goToNextVideo}
                    className="blackButton"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          )}
        </Player>
      )}

      {!isQuizItem && (
        <>
          <h1 className="mt-4 text-3xl font-semibold">{videoData?.title}</h1>
          <p className="pt-2 pb-6">{videoData?.description}</p>
        </>
      )}
    </div>
  )
}

export default VideoDetails
