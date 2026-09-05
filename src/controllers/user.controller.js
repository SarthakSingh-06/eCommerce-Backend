import { User } from "../models/user.model.js";
import { API_Error } from "../utils/api-error.js";
import { API_Response } from "../utils/api-response.js";
import { uploadImageOnCloudinary } from "../utils/cloudinary.js";
import {
    signupValidationSchema,
    signinValidationSchema,
} from "../validators/user.validator.js";

async function signup(req, res) {
    const validationResult = await signupValidationSchema.safeParseAsync(req.body);
    if (validationResult.error)
        throw API_Error.badRequest(JSON.stringify(validationResult.error.issues));

    const { name, email, password } = validationResult.data;

    const existingUser = await User.findOne({ email }, { _id: 1 });
    if (existingUser)
        throw API_Error.conflict(`User with email ${email} already exists`);

    const profileImageLocalPath = req?.file?.path;
    const profileImageOnCloudinary = await uploadImageOnCloudinary(profileImageLocalPath);

    if (!profileImageOnCloudinary)
        throw API_Error.badRequest("Provide an image to upload on cloudinary");

    const newUser = await User.insertOne({
        name, email, password,
        profileImage: {
            id: profileImageOnCloudinary.public_id,
            secure_url: profileImageOnCloudinary.secure_url
        },
    });

    const accessToken = newUser.getJWT_Token();

    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
    });

    return API_Response.created(
        res,
        "User signed up successfully",
        {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            profileImageURL: newUser.profileImage.secure_url
        },
    );
};

export {
    signup
};
