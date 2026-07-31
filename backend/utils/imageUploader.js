const cloudinary = require('cloudinary').v2;

const fs = require('fs');

exports.uploadImageToCloudinary = async (file, folder, height, quality) => {
    try {
        const isVideo = (file && file.mimetype && file.mimetype.startsWith('video/')) || 
                        (file && file.name && /\.(mp4|mkv|mov|avi|webm|flv|wmv)$/i.test(file.name));

        const options = { 
            folder: folder || process.env.FOLDER_NAME || "LearnHub", 
            resource_type: isVideo ? 'video' : 'auto' 
        };
        
        if (!isVideo && height) options.height = height;
        if (!isVideo && quality) options.quality = quality;

        let target = null;
        if (typeof file === 'string') {
            target = file;
        } else if (file && file.tempFilePath && fs.existsSync(file.tempFilePath)) {
            target = file.tempFilePath;
        } else if (file && file.path && fs.existsSync(file.path)) {
            target = file.path;
        }

        if (target) {
            if (isVideo || (file && file.size && file.size > 10 * 1024 * 1024)) {
                // upload_large returns a writable stream.  Await the callback
                // instead, so callers receive the final Cloudinary result (and
                // therefore its secure_url) only after all chunks are uploaded.
                return await new Promise((resolve, reject) => {
                    cloudinary.uploader.upload_large(
                        target,
                        {
                            ...options,
                            chunk_size: 6000000, // 6MB chunks for large video files
                            resource_type: isVideo ? 'video' : 'auto'
                        },
                        (error, result) => {
                            if (error) return reject(error);
                            resolve(result);
                        }
                    );
                });
            }
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
        // Extract public ID from the URL
        const publicId = url.split('/').pop().split('.')[0];
        const result = await cloudinary.uploader.destroy(publicId);
        console.log(`Deleted resource with public ID: ${publicId}`);
        console.log('Delete Resourse result = ', result)
        return result;
    } catch (error) {
        console.error(`Error deleting resource with public ID ${url}:`, error);
        throw error;
    }
};
