import { Product } from "../models/product.model.js";
import { API_Error } from "../utils/api-error.js";
import { API_Response } from "../utils/api-response.js";
import { WhereClause } from "../utils/where-clause.js";
import { uploadImageOnCloudinary, deleteFileOnCloudinary } from "../utils/cloudinary.js";
import { Types as mongooseTypes } from "mongoose";
import {
    addProductValidationSchema,
    updateProductValidationSchema
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

        return API_Response.created(res, "Product created successfully", product);

    } catch (error) {
        // If database creation or another operation fails,
        // remove already uploaded images from Cloudinary.
        for (const photo of uploadedPhotos) {
            await deleteFileOnCloudinary(photo.id);
        };

        console.log(error);
    }
};

async function getAllProducts(req, res) {
    const totalProducts = await Product.countDocuments();

    const whereClause = new WhereClause(Product, req.query).search().filter();

    const filteredProducts = (await whereClause.baseModel.clone()).length;

    whereClause.pager(10);

    const pagerResult = await whereClause.baseModel;

    return API_Response.ok(
        res,
        "Products fetched successfully",
        {
            pagerResult,
            totalProducts,
            filteredProducts,
        }
    );
};

async function getOneProduct(req, res) {
    const { id } = req.params;

    const product = await Product.findById(id).select("-__v");

    if (!product)
        throw API_Error.notFound("Product not found");

    return API_Response.ok(
        res,
        "Product fetched successfully",
        product
    );
};

async function adminUpdateOneProduct(req, res) {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product)
        throw API_Error.notFound("Product not found");

    const validationResult = await updateProductValidationSchema.safeParseAsync(req.body);

    if (!validationResult.success)
        throw API_Error.badRequest(validationResult.error.issues[0].message);

    const updateData = validationResult.data;

    // Upload new product images if provided
    if (req.files && req.files.length > 0) {
        const uploadedPhotos = [];
        try {
            // Upload all new images first
            for (const file of req.files) {
                const uploadResponse = await uploadImageOnCloudinary(
                    file.path,{ folder: "products",}
                );

                if (!uploadResponse)
                    throw API_Error.internalServerError("Failed to upload product image");

                uploadedPhotos.push({
                    id: uploadResponse.public_id,
                    secure_url: uploadResponse.secure_url,
                });
            }

        } catch (error) {

            // Delete successfully uploaded new images
            for (const photo of uploadedPhotos) {
                await deleteFileOnCloudinary(photo.id);
            }

            console.log(error);
        }

        // New images uploaded successfully.
        // Now delete old images from Cloudinary.
        for (const photo of product.photos) {
            await deleteFileOnCloudinary(photo.id);
        }

        // Store new image details in database
        updateData.photos = uploadedPhotos;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        id,
        updateData,
        {
            new: true,
            runValidators: true,
        }
    );

    return API_Response.ok(res, "Product updated successfully", updatedProduct);
};

async function adminDeleteOneProduct(req, res) {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product)
        throw API_Error.notFound("Product not found");

    for (const photo of product.photos) {
        await deleteFileOnCloudinary(photo.id);
    }

    return API_Response.ok(
        res,
        "Product deleted successfully"
    );
}

async function adminGetAllProducts(req, res) {
    const products = await Product.find();

    return API_Response.ok(
        res,
        "Products fetched successfully",
        products
    );
};

export {
    addProduct, getAllProducts, adminGetAllProducts,
    getOneProduct, adminDeleteOneProduct, adminUpdateOneProduct
};
