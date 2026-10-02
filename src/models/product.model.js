import { Schema, model } from "mongoose";

const productSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Please enter product name"],
            trim: true,
            maxlength: [120, "Product name cannot be more than 120 characters"]
        },

        price: {
            type: Number,
            required: [true, "Please provide product price"],
            min: 0,
            max: [999999, "Price cannot be more than 9,99,999"],
        },

        description: {
            type: String,
            required: [true, "Please enter product description"],
        },

        photos: [
            {
                id: {
                    type: String,
                    required: true,
                },
                secure_url: {
                    type: String,
                    required: true,
                }
            },
        ],

        brand: {
            type: String,
            required: [true, "Please enter product brand"],
            trim: true,
        },

        category: {
            type: String,
            required: [true, "Please select a product category"],
            enum: {
                values: ["short-sleeves", "long-sleeves", "sweat-shirt", "hoodies"],
                message: "{VALUE} is not a valid product category",
            },
        },

        stock: {
            type: Number,
            required: [true, "Please enter product stock"],
            min: 0,
            default: 0,
        },

        ratings: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },

        numOfReviews: {
            type: Number,
            default: 0,
            min: 0,
        },

        reviews: [
            {
                user: {
                    type: Schema.Types.ObjectId,
                    ref: "User",
                    required: true,
                },

                name: {
                    type: String,
                    required: true,
                },

                rating: {
                    type: Number,
                    required: true,
                    min: 1,
                    max: 5,
                },

                comment: {
                    type: String,
                    required: true,
                },
            },
        ],

        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export const Product = model("Product", productSchema);
