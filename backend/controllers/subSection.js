const Section = require('../models/section');
const SubSection = require('../models/subSection');
const Quiz = require('../models/Quiz');
const { uploadImageToCloudinary } = require('../utils/imageUploader');



// ================ create SubSection ================
exports.createSubSection = async (req, res) => {
    try {
        // extract data
        const { title, description, sectionId, isQuiz, quizUrl } = req.body;

        // extract video file
        const videoFile = req.files ? (req.files.video || req.files.videoFile) : null;

        const isQuizItem = isQuiz === "true" || isQuiz === true || Boolean(quizUrl);

        // validation
        if (!title || !sectionId) {
            return res.status(400).json({
                success: false,
                message: 'Title and Section ID are required'
            });
        }

        if (!isQuizItem && !videoFile) {
            return res.status(400).json({
                success: false,
                message: 'Video file is required for video lectures'
            });
        }

        let videoUrl = "";
        let timeDuration = "0";

        if (isQuizItem) {
            videoUrl = quizUrl || "";
            timeDuration = "Quiz / Assessment";
        } else if (videoFile) {
            const videoFileDetails = await uploadImageToCloudinary(videoFile, process.env.FOLDER_NAME);
            videoUrl = videoFileDetails.secure_url;
            timeDuration = `${videoFileDetails?.duration || 0}`;
        }

        // A native quiz is created before the subsection, so its URL carries
        // the quiz id until this handler can establish the two-way link.
        const localQuizMatch = typeof quizUrl === "string" && quizUrl.match(/^\/quiz\/([a-f\d]{24})$/i);
        const quizId = localQuizMatch?.[1];

        // create entry in DB
        const SubSectionDetails = await SubSection.create({
            title,
            timeDuration,
            description: description || "",
            videoUrl,
            isQuiz: isQuizItem,
            quizUrl: isQuizItem ? (quizUrl || "") : "", // only set quizUrl for quiz items, NOT for video lectures
            quizId: quizId || undefined,
        });

        if (quizId) {
            const quiz = await Quiz.findByIdAndUpdate(
                quizId,
                { subSectionId: SubSectionDetails._id },
                { new: true }
            );
            if (!quiz) {
                await SubSection.findByIdAndDelete(SubSectionDetails._id);
                return res.status(404).json({ success: false, message: "Interactive quiz not found" });
            }
        }

        // link subsection id to section
        const updatedSection = await Section.findByIdAndUpdate(
            { _id: sectionId },
            { $push: { subSection: SubSectionDetails._id } },
            { new: true }
        ).populate("subSection");

        // return response
        res.status(200).json({
            success: true,
            data: updatedSection,
            message: 'SubSection created successfully'
        });
    }
    catch (error) {
        console.error('Error while creating SubSection:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error while creating SubSection'
        });
    }
}



// ================ Update SubSection ================
exports.updateSubSection = async (req, res) => {
    try {
        const { sectionId, subSectionId, title, description, isQuiz, quizUrl } = req.body;

        // validation
        if (!subSectionId) {
            return res.status(400).json({
                success: false,
                message: 'subSection ID is required to update'
            });
        }

        // find in DB
        const subSection = await SubSection.findById(subSectionId);

        if (!subSection) {
            return res.status(404).json({
                success: false,
                message: "SubSection not found",
            });
        }

        // add data
        if (title) {
            subSection.title = title;
        }

        if (description !== undefined) {
            subSection.description = description;
        }

        if (isQuiz !== undefined) {
            subSection.isQuiz = isQuiz === "true" || isQuiz === true;
        }

        if (quizUrl !== undefined) {
            subSection.quizUrl = quizUrl;
            if (subSection.isQuiz) {
                subSection.videoUrl = quizUrl;
            }
        }

        // upload video to cloudinary if provided
        const video = req.files ? (req.files.video || req.files.videoFile) : null;
        if (video) {
            const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);
            subSection.videoUrl = uploadDetails.secure_url;
            subSection.timeDuration = `${uploadDetails?.duration || 0}`;
            subSection.isQuiz = false;
        }

        // save data to DB
        await subSection.save();

        const updatedSection = await Section.findById(sectionId).populate("subSection");

        return res.json({
            success: true,
            data: updatedSection,
            message: "Section updated successfully",
        });
    }
    catch (error) {
        console.error('Error while updating the section');
        console.error(error);
        return res.status(500).json({
            success: false,
            error: error.message,
            message: "Error while updating the section",
        });
    }
}



// ================ Delete SubSection ================
exports.deleteSubSection = async (req, res) => {
    try {
        const { subSectionId, sectionId } = req.body
        await Section.findByIdAndUpdate(
            { _id: sectionId },
            {
                $pull: {
                    subSection: subSectionId,
                },
            }
        )

        // delete from DB
        const subSection = await SubSection.findByIdAndDelete({ _id: subSectionId })

        if (!subSection) {
            return res
                .status(404)
                .json({ success: false, message: "SubSection not found" })
        }

        const updatedSection = await Section.findById(sectionId).populate('subSection')

        // In frontned we have to take care - when subsection is deleted we are sending ,
        // only section data not full course details as we do in others 

        // success response
        return res.json({
            success: true,
            data: updatedSection,
            message: "SubSection deleted successfully",
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,

            error: error.message,
            message: "An error occurred while deleting the SubSection",
        })
    }
}
