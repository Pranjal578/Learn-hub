import React, { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { MdOutlineClass } from "react-icons/md"

// import CourseCard from "../components/Catalog/CourseCard"
// import CourseSlider from "../components/Catalog/CourseSlider"
import Footer from "../components/common/Footer"
import Course_Card from '../components/core/Catalog/Course_Card'
import Course_Slider from "../components/core/Catalog/Course_Slider"
import Loading from './../components/common/Loading';

import { getCatalogPageData } from '../services/operations/pageAndComponentData'
import { fetchCourseCategories } from './../services/operations/courseDetailsAPI';
import { fetchAllClassroomsPublic } from '../services/operations/classroomAPI';




function Catalog() {

    const { catalogName } = useParams()
    const dispatch = useDispatch()
    const { token } = useSelector((state) => state.auth)
    const { classrooms } = useSelector((state) => state.classroom)
    const [active, setActive] = useState(1)
    const [catalogPageData, setCatalogPageData] = useState(null)
    const [categoryId, setCategoryId] = useState("")
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (token) {
            dispatch(fetchAllClassroomsPublic(token))
        }
    }, [token, dispatch])

    // Fetch All Categories
    useEffect(() => {
        ; (async () => {
            try {
                const res = await fetchCourseCategories();
                const category_id = res.filter(
                    (ct) => ct.name.split(" ").join("-").toLowerCase() === catalogName
                )[0]._id
                setCategoryId(category_id)
            } catch (error) {
                console.log("Could not fetch Categories.", error)
            }
        })()
    }, [catalogName])


    useEffect(() => {
        if (categoryId) {
            ; (async () => {
                setLoading(true)
                try {
                    const res = await getCatalogPageData(categoryId)
                    setCatalogPageData(res)
                } catch (error) {
                    console.log(error)
                }
                setLoading(false)
            })()
        }
    }, [categoryId])

    // console.log('======================================= ', catalogPageData)
    // console.log('categoryId ==================================== ', categoryId)

    if (loading) {
        return (
            <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
                <Loading />
            </div>
        )
    }
    if (!loading && !catalogPageData) {
        return (
            <div className="text-white text-4xl flex justify-center items-center mt-[20%]">
                No Courses found for selected Category
            </div>)
    }



    return (
        <>
            {/* Hero Section */}
            <div className=" box-content bg-richblack-800 px-4">
                <div className="mx-auto flex min-h-[260px] max-w-maxContentTab flex-col justify-center gap-4 lg:max-w-maxContent ">
                    <p className="text-sm text-richblack-300">
                        {`Home / Catalog / `}
                        <span className="text-yellow-25">
                            {catalogPageData?.selectedCategory?.name}
                        </span>
                    </p>
                    <p className="text-3xl text-richblack-5">
                        {catalogPageData?.selectedCategory?.name}
                    </p>
                    <p className="max-w-[870px] text-richblack-200">
                        {catalogPageData?.selectedCategory?.description}
                    </p>
                </div>
            </div>

            {/* Section 1 */}
            <div className=" mx-auto box-content w-full max-w-maxContentTab px-4 py-12 lg:max-w-maxContent">
                <div className="section_heading">Courses to get you started</div>
                <div className="my-4 flex border-b border-b-richblack-600 text-sm">
                    <p
                        className={`px-4 py-2 ${active === 1
                            ? "border-b border-b-yellow-25 text-yellow-25"
                            : "text-richblack-50"
                            } cursor-pointer`}
                        onClick={() => setActive(1)}
                    >
                        Most Populer
                    </p>
                    <p
                        className={`px-4 py-2 ${active === 2
                            ? "border-b border-b-yellow-25 text-yellow-25"
                            : "text-richblack-50"
                            } cursor-pointer`}
                        onClick={() => setActive(2)}
                    >
                        New
                    </p>
                </div>
                <div>
                    <Course_Slider
                        Courses={catalogPageData?.selectedCategory?.courses}
                    />
                </div>
            </div>

            {/* Section 2 */}
            <div className=" mx-auto box-content w-full max-w-maxContentTab px-4 py-12 lg:max-w-maxContent">
                <div className="section_heading">
                    Top courses in {catalogPageData?.differentCategory?.name}
                </div>
                <div>
                    <Course_Slider
                        Courses={catalogPageData?.differentCategory?.courses}
                    />
                </div>
            </div>

            {/* Section 3 */}
            <div className=" mx-auto box-content w-full max-w-maxContentTab px-4 py-12 lg:max-w-maxContent">
                <div className="section_heading">Frequently Bought</div>
                <div className="py-8">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {catalogPageData?.mostSellingCourses
                            ?.slice(0, 4)
                            .map((course, i) => (
                                <Course_Card course={course} key={i} Height={"h-[300px]"} />
                            ))}
                    </div>
                </div>
            </div>
            {/* Section 4: Available Classrooms */}
            {classrooms && classrooms.length > 0 && (
                <div className="mx-auto box-content w-full max-w-maxContentTab px-4 py-12 lg:max-w-maxContent">
                    <div className="section_heading mb-6">Active Live Classrooms</div>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {classrooms.map((cls) => (
                            <div
                                key={cls._id}
                                className="flex flex-col justify-between rounded-xl border border-richblack-700 bg-richblack-800 p-6 shadow-md hover:border-yellow-50 transition-all duration-200"
                            >
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <MdOutlineClass className="text-yellow-50 text-xl" />
                                        <h3 className="text-lg font-semibold text-richblack-5">{cls.className}</h3>
                                    </div>
                                    <p className="text-xs text-richblack-300 line-clamp-2 mb-3">{cls.description}</p>
                                    <p className="text-xs text-richblack-400 mb-1">
                                        Instructor: {cls.instructor?.firstName} {cls.instructor?.lastName}
                                    </p>
                                    <p className="text-xs text-richblack-400 mb-4">
                                        Duration: {cls.duration} • {cls.studentsEnrolled?.length ?? 0} enrolled
                                    </p>
                                </div>
                                <div className="space-y-3 pt-3 border-t border-richblack-700">
                                    <div className="flex items-center justify-between rounded-lg bg-richblack-900 px-3 py-2">
                                        <span className="text-xs text-richblack-300">Join Code:</span>
                                        <span className="font-mono text-sm font-bold tracking-wider text-yellow-50">
                                            {cls.uniqueCode}
                                        </span>
                                    </div>
                                    <Link
                                        to={`/classroom/${cls._id}`}
                                        className="block text-center rounded-lg bg-yellow-50 py-2 text-xs font-semibold text-richblack-900 hover:bg-yellow-25 transition-all"
                                    >
                                        View Classroom
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <Footer />
        </>
    )
}

export default Catalog
