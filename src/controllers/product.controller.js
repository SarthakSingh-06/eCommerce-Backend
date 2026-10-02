import { Product } from "../models/product.model.js";
import { User } from "../models/user.model.js";
import { API_Error } from "../utils/api-error.js";
import { API_Response } from "../utils/api-response.js";
import { uploadImageOnCloudinary, deleteFileOnCloudinary } from "../utils/cloudinary.js";
import { Types as mongooseTypes } from "mongoose";
import {
    addProductValidationSchema,
} from "../validators/product.validator.js";

async function addProduct(req, res) {
    const validationResult = await addProductValidationSchema.safeParseAsync(req.body);

    if (!validationResult.success)
        throw API_Error.badRequest(validationResult.error.issues[0].message);

    const { name, price, description, brand, category, stock } = validationResult.data;

    // Check if product images are uploaded
    if (!req.files || req.files.length === 0)
        throw API_Error.badRequest("Please upload at least one product image");

    const uploadedPhotos = [];

    try {
        // Upload product images to Cloudinary
        for (const file of req.files) {
            const uploadResponse = await uploadImageOnCloudinary(file.path, {
                    folder: "products",
                }
            );

            if (!uploadResponse) {
                throw API_Error.internalServerError("Failed to upload product image");
            }

            uploadedPhotos.push({
                id: uploadResponse.public_id,
                secure_url: uploadResponse.secure_url,
            });
        }

        const product = await Product.insertOne({
            name, price, description,
            photos: uploadedPhotos,
            brand, category, stock,
            user: new mongooseTypes.ObjectId(req.user._id),
        });

        return API_Response.created(res,"Product created successfully",product);

    } catch (error) {
        // If database creation or another operation fails,
        // remove already uploaded images from Cloudinary.
        for (const photo of uploadedPhotos) {
            await deleteFileOnCloudinary(photo.id);
        };

        console.log(error);
    }
};

export {
    addProduct,
}
