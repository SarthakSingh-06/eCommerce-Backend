import { z } from "zod";

const addProductValidationSchema = z.object({
    name: z.string("Please enter product name")
        .trim()
        .min(1, "Product name is required")
        .max(120, "Product name cannot be more than 120 characters"),

    price: z.coerce.number("Please provide product price")
        .min(0, "Price cannot be negative")
        .max(999999, "Price cannot be more than 9,99,999"),

    description: z.string("Please enter product description")
        .trim()
        .min(1, "Product description is required"),

    brand: z.string("Please enter product brand")
        .trim()
        .min(1, "Product brand is required"),

    category: z.enum(
        [
            "short-sleeves",
            "long-sleeves",
            "sweat-shirt",
            "hoodies",
        ],
        "Please select a valid product category"
    ),


    stock: z.coerce.number("Please enter product stock")
        .min(0, "Stock cannot be negative")
        .default(0),
});

const updateProductValidationSchema = z.object({
    name: z.string("Please enter product name")
        .trim()
        .min(1, "Product name is required")
        .max(120, "Product name cannot be more than 120 characters")
        .optional(),

    price: z.coerce.number("Please provide product price")
        .min(0, "Price cannot be negative")
        .max(999999, "Price cannot be more than 9,99,999")
        .optional(),

    description: z.string("Please enter product description")
        .trim()
        .min(1, "Product description is required")
        .optional(),

    brand: z.string("Please enter product brand")
        .trim()
        .min(1, "Product brand is required")
        .optional(),

    category: z.enum(
        [
            "short-sleeves",
            "long-sleeves",
            "sweat-shirt",
            "hoodies",
        ],
        "Please select a valid product category"
    ).optional(),

    stock: z.coerce.number("Please enter product stock")
        .min(0, "Stock cannot be negative")
        .optional(),

    ratings: z.coerce.number("Please provide product rating")
        .min(0, "Rating cannot be negative")
        .max(5, "Rating cannot be more than 5")
        .optional(),

    numOfReviews: z.coerce.number("Please provide number of reviews")
        .min(0, "Number of reviews cannot be negative")
        .optional(),
});

export {
    addProductValidationSchema,
    updateProductValidationSchema
};
