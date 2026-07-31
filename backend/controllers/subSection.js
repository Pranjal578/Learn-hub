const Section = require('../models/section');
const SubSection = require('../models/subSection');
const Quiz = require('../models/Quiz');
const { uploadImageToCloudinary, deleteResourceFromCloudinary } = require('../utils/imageUploader');



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
            videoUrl = videoFileDetails?.secure_url;
            if (!videoUrl) {
                throw new Error("Video upload completed without a playable URL");
            }
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
        // Cloudinary rejects files over 100 MB on the free plan
        if (error?.http_code === 400 && error?.message?.toLowerCase().includes('file size too large')) {
            return res.status(400).json({
                success: false,
                message: `Video file is too large for upload (max 100 MB). Please compress your video or use a smaller file.`
            });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to create lecture. Please try again.'
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

        if (subSection.isQuiz) {
            if (quizUrl !== undefined) {
                subSection.quizUrl = quizUrl;
                subSection.videoUrl = quizUrl; // For quizzes, videoUrl might store the quiz link
            }
        }

        // upload video to cloudinary if provided
        const video = req.files ? (req.files.video || req.files.videoFile) : null;
        if (video) {
            // If a new video is uploaded, delete the old one from Cloudinary
            if (subSection.videoUrl) {
                await deleteResourceFromCloudinary(subSection.videoUrl);
            }

            const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);
            if (!uploadDetails?.secure_url) {
                throw new Error("Video upload completed without a playable URL");
            }
            subSection.videoUrl = uploadDetails.secure_url;
            subSection.timeDuration = `${uploadDetails?.duration || 0}`;
            subSection.isQuiz = false; // It's a video lecture now
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
        console.error('Error while updating SubSection:', error);
        // Cloudinary rejects files over 100 MB on the free plan
        if (error?.http_code === 400 && error?.message?.toLowerCase().includes('file size too large')) {
            return res.status(400).json({
                success: false,
                message: `Video file is too large for upload (max 100 MB). Please compress your video or use a smaller file.`
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Failed to update lecture. Please try again.'
        });
    }
}





// ... (other code) ...

// ================ Delete SubSection ================
exports.deleteSubSection = async (req, res) => {
    try {
        const { subSectionId, sectionId } = req.body;

        // Find the subsection to be deleted to get its details
        const subSection = await SubSection.findById(subSectionId);

        if (!subSection) {
            return res.status(404).json({ success: false, message: "SubSection not found" });
        }

        // Remove subsection from the section
        await Section.findByIdAndUpdate(
            { _id: sectionId },
            {
                $pull: {
                    subSection: subSectionId,
                },
            }
        );

        // Delete the video from Cloudinary if it exists
        if (subSection.videoUrl && !subSection.isQuiz) {
            await deleteResourceFromCloudinary(subSection.videoUrl);
        }

        // Delete the subsection from the database
        await SubSection.findByIdAndDelete({ _id: subSectionId });

        const updatedSection = await Section.findById(sectionId).populate('subSection');

        // Success response
        return res.json({
            success: true,
            data: updatedSection,
            message: "SubSection deleted successfully",
        });
    } catch (error) {
        console.error('Error while deleting SubSection:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete lecture. Please try again.'
        });
    }
};
