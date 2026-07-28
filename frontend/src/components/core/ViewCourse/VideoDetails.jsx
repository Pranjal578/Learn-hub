import React, { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useLocation } from "react-router-dom"
import { useNavigate, useParams } from "react-router-dom"

import "video-react/dist/video-react.css"
import { BigPlayButton, Player } from "video-react"

import { markLectureAsComplete } from "../../../services/operations/courseDetailsAPI"
import { updateCompletedLectures } from "../../../slices/viewCourseSlice"
import { setCourseViewSidebar } from "../../../slices/sidebarSlice"

import IconBtn from "../../common/IconBtn"

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

  const [videoData, setVideoData] = useState([])
  const [previewSource, setPreviewSource] = useState("")
  const [videoEnded, setVideoEnded] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    ; (async () => {
      if (!courseSectionData.length) return
      if (!courseId && !sectionId && !subSectionId) {
        navigate(`/dashboard/enrolled-courses`)
      } else {
        const filteredData = courseSectionData.filter(
          (course) => course._id === sectionId
        )
        const filteredVideoData = filteredData?.[0]?.subSection.filter(
          (data) => data._id === subSectionId
        )
        if (filteredVideoData) setVideoData(filteredVideoData[0])
        setPreviewSource(courseEntireData.thumbnail)
        setVideoEnded(false)
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

  const { courseViewSidebar } = useSelector(state => state.sidebar)

  if (courseViewSidebar && window.innerWidth <= 640) return;

  const isQuizItem = videoData?.isQuiz || Boolean(videoData?.quizUrl)
  const quizLink = videoData?.quizUrl || videoData?.videoUrl
  const isCompleted = completedLectures.includes(subSectionId)

  return (
    <div className="flex flex-col gap-5 text-white">

      {/* open - close side bar icons */}
      <div className="sm:hidden text-white absolute left-7 top-3 cursor-pointer " onClick={() => dispatch(setCourseViewSidebar(!courseViewSidebar))}>
        {
          !courseViewSidebar && <HiMenuAlt1 size={33} />
        }
      </div>

      {isQuizItem ? (
        /* QUIZ ASSESSMENT CARD VIEW */
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
                href={quizLink.startsWith("http") ? quizLink : `https://${quizLink}`}
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
        <img
          src={previewSource}
          alt="Preview"
          className="h-full w-full rounded-md object-cover"
        />
      ) : (
        /* VIDEO LECTURE PLAYER VIEW */
        <Player
          ref={playerRef}
          aspectRatio="16:9"
          playsInline
          autoPlay
          onEnded={() => setVideoEnded(true)}
          src={videoData?.videoUrl}
        >
          <BigPlayButton position="center" />
          {/* Render When Video Ends */}
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
