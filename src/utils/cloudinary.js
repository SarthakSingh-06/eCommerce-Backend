import "dotenv/config";
import { v2 as cloudinary } from 'cloudinary';
import { unlinkSync } from "node:fs";

// configure cloudinary
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImageOnCloudinary = async (imagePath, options={}) => {
    try {
        if (!imagePath) return null;
        const uploadResponse = await cloudinary.uploader.upload(imagePath, {
            use_filename: true,
            ...options
        });

        unlinkSync(imagePath);
        return uploadResponse;
    } catch (error) {
        unlinkSync(imagePath);
        console.log("Image upload to cloudinary failed!!");
        console.log(error);
    }
};

export const deleteFileOnCloudinary = async (publicId) => {
    try {
        if (!publicId) return null;
        const deleteResponse = await cloudinary.uploader.destroy(publicId);
        return deleteResponse;
    } catch (error) {
        console.log("Image deletion from cloudinary failed!!");
        console.log(error);
    }
};
