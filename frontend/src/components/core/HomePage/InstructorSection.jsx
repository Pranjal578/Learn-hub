import React from 'react'
import Instructor from '../../../assets/Images/teacher3.png'
import HighlightText from './HighlightText'
import CTAButton from "../HomePage/Button"
import { FaArrowRight } from 'react-icons/fa'
import Img from './../../common/Img';

const InstructorSection = () => {
  return (
    <div className="relative rounded-3xl border border-yellow-50/40 bg-gradient-to-r from-richblack-800 via-richblack-900 to-richblack-800 p-8 lg:p-12 shadow-[0_0_50px_rgba(255,214,10,0.15)] overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-yellow-50/10 blur-3xl pointer-events-none"></div>

      <div className='flex flex-col-reverse lg:flex-row gap-10 lg:gap-20 items-center relative z-10'>

        <div className='lg:w-[50%] '>
          <Img
            src={Instructor}
            alt="Instructor"
            className='shadow-2xl shadow-yellow-50/10 rounded-3xl border border-richblack-700'
          />
        </div>

        <div className='lg:w-[50%] flex flex-col'>
          <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-yellow-50/50 bg-yellow-50/10 px-4 py-1.5 text-xs font-semibold text-yellow-50 shadow-sm">
            <span>✨ TEACH ON LEARNHUB</span>
          </div>

          <div className='text-3xl lg:text-4xl font-bold w-[80%] mb-4 text-richblack-5'>
            Become an <HighlightText text={"Instructor"} />
          </div>

          <p className='font-medium text-[16px] w-[90%] text-richblack-200 mb-8 leading-relaxed'>
            Instructors from around the world teach millions of students on LearnHub. We provide the tools, platform, and audience for you to teach what you love and earn online.
          </p>

          <div className='w-fit'>
            <CTAButton active={true} linkto={"/signup/instructor"}>
              <div className='flex flex-row gap-2 items-center font-bold text-richblack-900'>
                Start Teaching Today
                <FaArrowRight />
              </div>
            </CTAButton>
          </div>
        </div>

      </div>
    </div>
  )
}

export default InstructorSection
