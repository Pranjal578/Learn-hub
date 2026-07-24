import React from "react"
import "swiper/css"
import "swiper/css/free-mode"
import "swiper/css/pagination"
import { Swiper, SwiperSlide } from "swiper/react"
import Course_Card from "./Course_Card"

function Course_Slider({ Courses }) {
  if (Courses === undefined || Courses === null) {
    return (
      <div className="flex flex-col sm:flex-row gap-6">
        <p className="h-[201px] w-full rounded-xl skeleton"></p>
        <p className="h-[201px] w-full rounded-xl hidden lg:flex skeleton"></p>
        <p className="h-[201px] w-full rounded-xl hidden lg:flex skeleton"></p>
      </div>
    )
  }

  if (Courses.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 bg-richblack-800 rounded-xl border border-richblack-700">
        <p className="text-xl font-medium text-richblack-300">No Courses Found</p>
      </div>
    )
  }

  return (
    <Swiper
      slidesPerView={1}
      spaceBetween={25}
      loop={Courses.length > 3}
      breakpoints={{
        1024: {
          slidesPerView: 3,
        },
      }}
      className="max-h-[30rem] pt-8 px-2"
    >
      {Courses.map((course, i) => (
        <SwiperSlide key={i}>
          <Course_Card course={course} Height={"h-[250px]"} />
        </SwiperSlide>
      ))}
    </Swiper>
  )
}

export default Course_Slider
