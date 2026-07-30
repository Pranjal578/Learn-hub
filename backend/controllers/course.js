const Course = require('../models/course');
const User = require('../models/user');
const Category = require('../models/category');
const Section = require('../models/section')
const SubSection = require('../models/subSection')
const CourseProgress = require('../models/courseProgress')

const { uploadImageToCloudinary, deleteResourceFromCloudinary } = require('../utils/imageUploader');
const { convertSecondsToDuration } = require("../utils/secToDuration")



// ================ create new course ================
exports.createCourse = async (req, res) => {
    try {
        // extract data
        let { courseName, courseDescription, whatYouWillLearn, price, category, instructions: _instructions, status, tag: _tag } = req.body;

        // Safely parse tag & instructions
        let tag = ["General"];
        if (_tag) {
            try {
                tag = typeof _tag === "string" ? JSON.parse(_tag) : _tag;
            } catch {
                tag = Array.isArray(_tag) ? _tag : [_tag];
            }
        }

        let instructions = ["Basic understanding of the topic"];
        if (_instructions) {
            try {
                instructions = typeof _instructions === "string" ? JSON.parse(_instructions) : _instructions;
            } catch {
                instructions = Array.isArray(_instructions) ? _instructions : [_instructions];
            }
        }

        if (!Array.isArray(tag) || tag.length === 0) tag = ["General"];
        if (!Array.isArray(instructions) || instructions.length === 0) instructions = ["Basic understanding of the topic"];
        if (!whatYouWillLearn) whatYouWillLearn = "Learn core concepts and practical skills in this course.";
        if (price === undefined || price === null || price === "") price = 0;

        // Basic validation
        if (!courseName || !courseDescription || !category) {
            return res.status(400).json({
                success: false,
                message: 'Course title, description, and category are required'
            });
        }

        if (!status || status === undefined) {
            status = "Published";
        }

        const instructorId = req.user.id;

        // Check given category exists
        const categoryDetails = await Category.findById(category);
        if (!categoryDetails) {
            return res.status(404).json({
                success: false,
                message: 'Selected Category not found'
            });
        }

        // Upload thumbnail to Cloudinary if provided, else use default placeholder
        let thumbnailUrl = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop";
        if (req.files && req.files.thumbnailImage) {
            try {
                const thumbnailDetails = await uploadImageToCloudinary(req.files.thumbnailImage, process.env.FOLDER_NAME);
                thumbnailUrl = thumbnailDetails.secure_url;
            } catch (imgError) {
                console.error("Thumbnail upload error, using fallback image:", imgError);
            }
        }

        // Create new course - entry in DB
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorId,
            whatYouWillLearn,
            price: Number(price),
            category: categoryDetails._id,
            tag,
            status,
            instructions,
            thumbnail: thumbnailUrl,
            createdAt: Date.now(),
        });

        // Add course id to instructor courses list and Category concurrently for speed
        await Promise.all([
            User.findByIdAndUpdate(
                instructorId,
                { $push: { courses: newCourse._id } },
                { new: true }
            ),
            Category.findByIdAndUpdate(
                category,
                { $push: { courses: newCourse._id } },
                { new: true }
            )
        ]);

        // return response
        return res.status(200).json({
            success: true,
            data: newCourse,
            message: 'New Course created successfully'
        });
    }

    catch (error) {
        console.error('Error while creating new course:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create Course',
        });
    }
};


// ================ show all courses ================
exports.getAllCourses = async (req, res) => {
    try {
        const allCourses = await Course.find({},
            {
                courseName: true, courseDescription: true, price: true, thumbnail: true, instructor: true,
                ratingAndReviews: true, studentsEnrolled: true
            })
            .populate({
                path: 'instructor',
                select: 'firstName lastName email image'
            })
            .exec();

        return res.status(200).json({
            success: true,
            data: allCourses,
            message: 'Data for all courses fetched successfully'
        });
    }

    catch (error) {
        console.error('Error while fetching data of all courses:', error);
        res.status(500).json({
            success: false,
            message: 'Error while fetching data of all courses'
        })
    }
}



// ================ Get Course Details ================
exports.getCourseDetails = async (req, res) => {
    try {
        // get course ID
        const { courseId } = req.body;

        // find course details
        const courseDetails = await Course.findOne({
            _id: courseId,
        })
            .populate({
                path: "instructor",
                populate: {
                    path: "additionalDetails",
                },
            })
            .populate("category")
            .populate("ratingAndReviews")

            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                    select: "-videoUrl",
                },
            })
            .exec()


        //validation
        if (!courseDetails) {
            return res.status(400).json({
                success: false,
                message: `Could not find the course with ${courseId}`,
            });
        }

        // if (courseDetails.status === "Draft") {
        //   return res.status(403).json({
        //     success: false,
        //     message: `Accessing a draft course is forbidden`,
        //   });
        // }

        // console.log('courseDetails -> ', courseDetails)
        let totalDurationInSeconds = 0
        courseDetails.courseContent.forEach((content) => {
            content.subSection.forEach((subSection) => {
                const timeDurationInSeconds = parseInt(subSection.timeDuration)
                totalDurationInSeconds += timeDurationInSeconds
            })
        })

        const totalDuration = convertSecondsToDuration(totalDurationInSeconds)

        //return response
        return res.status(200).json({
            success: true,
            data: {
                courseDetails,
                totalDuration,
            },
            message: 'Fetched course data successfully'
        })
    }

    catch (error) {
        console.error('Error while fetching course details:', error);
        return res.status(500).json({
            success: false,
            message: 'Error while fetching course details',
        });
    }
}


// ================ Get Full Course Details ================
exports.getFullCourseDetails = async (req, res) => {
    try {
        const { courseId } = req.body
        const userId = req.user.id
        // console.log('courseId userId  = ', courseId, " == ", userId)

        const courseDetails = await Course.findOne({
            _id: courseId,
        })
            .populate({
                path: "instructor",
                populate: {
                    path: "additionalDetails",
                },
            })
            .populate("category")
            .populate("ratingAndReviews")
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                },
            })
            .exec()

        let courseProgressCount = await CourseProgress.findOne({
            courseID: courseId,
            userId: userId,
        })

        //   console.log("courseProgressCount : ", courseProgressCount)

        if (!courseDetails) {
            return res.status(404).json({
                success: false,
                message: `Could not find course with id: ${courseId}`,
            })
        }

        // if (courseDetails.status === "Draft") {
        //   return res.status(403).json({
        //     success: false,
        //     message: `Accessing a draft course is forbidden`,
        //   });
        // }

        //   count total time duration of course
        let totalDurationInSeconds = 0
        courseDetails.courseContent.forEach((content) => {
            content.subSection.forEach((subSection) => {
                const timeDurationInSeconds = parseInt(subSection.timeDuration)
                totalDurationInSeconds += timeDurationInSeconds
            })
        })

        const totalDuration = convertSecondsToDuration(totalDurationInSeconds)

        return res.status(200).json({
            success: true,
            data: {
                courseDetails,
                totalDuration,
                completedVideos: courseProgressCount?.completedVideos ? courseProgressCount?.completedVideos : [],
            },
        })
    } catch (error) {
        console.error('Error while fetching full course details:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch full course details',
        })
    }
}



// ================ Edit Course Details ================
exports.editCourse = async (req, res) => {
    try {
        const { courseId } = req.body
        const updates = req.body
        const course = await Course.findById(courseId)

        if (!course) {
            return res.status(404).json({ error: "Course not found" })
        }

        // If Thumbnail Image is found, update it
        if (req.files) {
            // console.log("thumbnail update")
            const thumbnail = req.files.thumbnailImage
            const thumbnailImage = await uploadImageToCloudinary(
                thumbnail,
                process.env.FOLDER_NAME
            )
            course.thumbnail = thumbnailImage.secure_url
        }

        // Update only the fields that are present in the request body
        for (const key in updates) {
            if (updates.hasOwnProperty(key)) {
                if (key === "tag" || key === "instructions") {
                    course[key] = JSON.parse(updates[key])
                } else {
                    course[key] = updates[key]
                }
            }
        }

        // updatedAt
        course.updatedAt = Date.now();

        //   save data
        await course.save()

        const updatedCourse = await Course.findOne({
            _id: courseId,
        })
            .populate({
                path: "instructor",
                populate: {
                    path: "additionalDetails",
                },
            })
            .populate("category")
            .populate("ratingAndReviews")
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                },
            })
            .exec()

        // success response
        res.status(200).json({
            success: true,
            message: "Course updated successfully",
            data: updatedCourse,
        })
    } catch (error) {
        console.error('Error while updating course:', error);
        res.status(500).json({
            success: false,
            message: "Error while updating course",
        })
    }
}



// ================ Get a list of Course for a given Instructor ================
exports.getInstructorCourses = async (req, res) => {
    try {
        // Get the instructor ID from the authenticated user or request body
        const instructorId = req.user.id

        // Find all courses belonging to the instructor
        const instructorCourses = await Course.find({ instructor: instructorId, }).sort({ createdAt: -1 })


        // Return the instructor's courses
        res.status(200).json({
            success: true,
            data: instructorCourses,
            // totalDurationInSeconds:totalDurationInSeconds,
            message: 'Courses made by Instructor fetched successfully'
        })
    } catch (error) {
        console.error('Error while fetching instructor courses:', error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve instructor courses",
        })
    }
}



// ================ Delete the Course ================
exports.deleteCourse = async (req, res) => {
    try {
        const { courseId } = req.body
        const userId = req.user.id
        const accountType = (req.user.accountType || "").toLowerCase()

        // Find the course
        const course = await Course.findById(courseId)
        if (!course) {
            return res.status(404).json({ message: "Course not found" })
        }

        // Check if user is instructor of the course or Admin
        const isOwner = course.instructor.toString() === userId
        const isAdmin = accountType === "admin"

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ success: false, message: "Unauthorized to delete this course" })
        }

        // Unenroll students from the course
        const studentsEnrolled = course.studentsEnrolled || []
        for (const studentId of studentsEnrolled) {
            await User.findByIdAndUpdate(studentId, {
                $pull: { courses: courseId },
            })
        }

        // Also remove course reference from instructor profile
        if (course.instructor) {
            await User.findByIdAndUpdate(course.instructor, {
                $pull: { courses: courseId },
            })
        }

        // delete course thumbnail From Cloudinary
        try {
            await deleteResourceFromCloudinary(course?.thumbnail);
        } catch (e) {
            console.warn("Cloudinary thumbnail deletion skipped/failed:", e.message);
        }

        // Delete sections and sub-sections
        const courseSections = course.courseContent || []
        for (const sectionId of courseSections) {
            // Delete sub-sections of the section
            const section = await Section.findById(sectionId)
            if (section) {
                const subSections = section.subSection || []
                for (const subSectionId of subSections) {
                    const subSection = await SubSection.findById(subSectionId)
                    if (subSection) {
                        try {
                            await deleteResourceFromCloudinary(subSection.videoUrl)
                        } catch (e) {
                            console.warn("Cloudinary video deletion skipped/failed:", e.message);
                        }
                    }
                    await SubSection.findByIdAndDelete(subSectionId)
                }
            }

            // Delete the section
            await Section.findByIdAndDelete(sectionId)
        }

        // Delete the course
        await Course.findByIdAndDelete(courseId)

        return res.status(200).json({
            success: true,
            message: "Course deleted successfully",
        })

    } catch (error) {
        console.error('Error while deleting course:', error);
        return res.status(500).json({
            success: false,
            message: "Error while Deleting course",
        })
    }
}




