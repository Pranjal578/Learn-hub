const cloudinary = require('cloudinary').v2;

const fs = require('fs');

exports.uploadImageToCloudinary = async (file, folder, height, quality) => {
    try {
        const options = { folder: folder || process.env.FOLDER_NAME || "LearnHub", resource_type: 'auto' };
        if (height) options.height = height;
        if (quality) options.quality = quality;

        let target = null;
        if (typeof file === 'string') {
            target = file;
        } else if (file && file.tempFilePath && fs.existsSync(file.tempFilePath)) {
            target = file.tempFilePath;
        } else if (file && file.path && fs.existsSync(file.path)) {
            target = file.path;
        }

        if (target) {
            return await cloudinary.uploader.upload(target, options);
        }

        // Fallback if file buffer exists
        if (file && file.data) {
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                });
                uploadStream.end(file.data);
            });
        }

        throw new Error("Invalid file upload object: file path or buffer missing");
    }
    catch (error) {
        console.log("Error while uploading file to Cloudinary:", error.message || error);
        throw error;
    }
}



// Function to delete a resource by public ID
exports.deleteResourceFromCloudinary = async (url) => {
    if (!url) return;

    try {
        const result = await cloudinary.uploader.destroy(url);
        console.log(`Deleted resource with public ID: ${url}`);
        console.log('Delete Resourse result = ', result)
        return result;
    } catch (error) {
        console.error(`Error deleting resource with public ID ${url}:`, error);
        throw error;
    }
};