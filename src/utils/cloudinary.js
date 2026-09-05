import "dotenv/config";
import { v2 as cloudinary } from 'cloudinary';
import { unlinkSync } from "node:fs";

// configure cloudinary
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImageOnCloudinary = async (imagePath) => {
    try {
        if (!imagePath) return null;
        const uploadResponse = await cloudinary.uploader.upload(imagePath, {
            use_filename: true
        });

        unlinkSync(imagePath);
        return uploadResponse;
    } catch (error) {
        unlinkSync(imagePath);
        console.log("Image upload to cloudinary failed!!");
        console.log(error);
    }
};
