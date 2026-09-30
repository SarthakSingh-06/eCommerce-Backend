import { User } from "../models/user.model.js";
import { API_Error } from "../utils/api-error.js";
import { API_Response } from "../utils/api-response.js";
import { uploadImageOnCloudinary, deleteFileOnCloudinary } from "../utils/cloudinary.js";
import { createHmac } from "node:crypto";
import {
    sendEmail,
    generateForgotPasswordMail
} from "../utils/email.js";
import {
    signupValidationSchema,
    signinValidationSchema,
    forgotPasswordValidationSchema,
    newPasswordValidationSchema,
    updatePasswordValidationSchema,
    updateUserDetailsValidationSchema,
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

async function signin(req, res) {
    const validationResult = await signinValidationSchema.safeParseAsync(req.body);
    if (validationResult.error)
        throw API_Error.badRequest(JSON.stringify(validationResult.error.issues));

    const { email, password } = validationResult.data;

    const existingUser = await User.findOne({ email }, { _id: 1, password: 1 });
    if (!existingUser)
        throw API_Error.notFound(`User with email ${email} does not exist`);

    // checking password might take some time
    const correctPassword = await existingUser.isPasswordCorrect(password);
    if (!correctPassword)
        throw API_Error.unauthorized("Incorrect email or password!");

    const accessToken = existingUser.getJWT_Token();

    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
    });

    return API_Response.ok(
        res,
        "User signed in successfully",
    );
};

function logout(req, res) {
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: true
    });

    return API_Response.ok(res, "User logged out successfully");
};

/**
 * @param {import("express").Request} req 
 * @param {*} res 
 */
async function forgotPassword(req, res) {
    const validationResult = await forgotPasswordValidationSchema.safeParseAsync(req.body);
    if (validationResult.error)
        throw new API_Error.badRequest(JSON.stringify(validationResult.error.issues));

    const { email } = validationResult.data;

    const existingUser = await User.findOne(
        { email },
        {
            _id: 1,
            name: 1
        }
    );
    if (!existingUser)
        throw API_Error.notFound(`User with email ${email} does not exist`);

    const forgotPasswordToken = existingUser.getForgotPasswordToken();
    await existingUser.save({ validateBeforeSave: false });

    const redirectLink = `${req.protocol}://${ req.get('host')}/resetpassword/${forgotPasswordToken}`;
    const { emailHTML, emailText } = generateForgotPasswordMail(existingUser.name, redirectLink);

    try {
        await sendEmail({
            from: "ecommerce.backend@gmail.com",
            to: email,
            subject: "Forgot Password Request",
            text: emailText,
            html: emailHTML
        });
    } catch (error) {
        existingUser.forgotPasswordToken = null;
        existingUser.forgotPasswordExpiry = null;
        await existingUser.save({ validateBeforeSave: false });
        throw API_Error.internalServerError(error.message);
    }

    return API_Response.ok(res, "Forgot password mail sent successfully");
};

async function resetPassword(req, res) {
    const token = req.params.token;
    const hashedToken = createHmac("sha256", token).digest("hex");

    const existingUser = await User.findOne({
        forgotPasswordToken: hashedToken,
        forgotPasswordExpiry: { $gt: Date.now() }
    }, {
        _id: 1
    });

    if (!existingUser)
        throw API_Error.badRequest("Invalid or expired token provided");

    const validationResult = await newPasswordValidationSchema.safeParseAsync(req.body);
    if (validationResult.error)
        throw API_Error.badRequest(validationResult.error);

    const { newPassword, confirmPassword } = validationResult.data;
    if (newPassword !== confirmPassword)
        throw API_Error.badRequest("New password and confirm password should be the same!");

    existingUser.password = newPassword;
    await existingUser.save({ validateBeforeSave: false });

    return API_Response.ok(res, "Password updated successfully");
};

async function updatePassword(req, res) {
    const validationResult = await updatePasswordValidationSchema.safeParseAsync(req.body);
    if (validationResult.error)
        throw API_Error.badRequest(JSON.stringify(validationResult.error.issues));

    const { oldPassword, newPassword } = validationResult.data;
    const existingUser = await User.findById(
        req.user._id,
        {
            password: 1
        }
    );
    
    const correctPassword = existingUser.isPasswordCorrect(oldPassword);
    if (!correctPassword)
        throw API_Error.unauthorized("Incorrect password or expired user token");

    existingUser.password = newPassword;
    await existingUser.save({ validateBeforeSave: false });

    return API_Response.ok(res, "Password changes successfully");
};

async function getUserDashboard(req, res) {
    const user = await User.findById(req.user._id).select(
        "-__v -createdAt -updatedAt"
    );

    return API_Response.ok(res, "user dashboard fetched successfully", user);
};

async function updateUserDetails(req, res) {
    const validationResult = await updateUserDetailsValidationSchema.safeParseAsync(req.body);
    if (validationResult.error)
        throw API_Error.badRequest(JSON.stringify(validationResult.error.issues));

    const { name, email } = validationResult.data;
    const newProfilePhoto = req?.file;

    if (name === undefined && email === undefined && !newProfilePhoto)
        throw API_Error.badRequest("Provide at least one detail to update");

    const newData = {};
    if (name !== undefined) newData.name = name;
    if (email !== undefined) newData.email = email;

    const existingUser = await User.findById(req.user._id, {
        name: 1,
        email: 1,
        role: 1,
        profileImage: 1
    });

    if (!existingUser)
        throw API_Error.notFound("User does not exist");

    if (newProfilePhoto?.path) {
        // upload new profile image
        const profileImageOnCloudinary = await uploadImageOnCloudinary(newProfilePhoto.path);

        if (!profileImageOnCloudinary)
            throw API_Error.badRequest("Unable to upload profile photo on cloudinary");

        // delete old profile image
        if (existingUser.profileImage?.id)
            await deleteFileOnCloudinary(existingUser.profileImage.id);

        // save new profile image in database
        newData.profileImage = {
            id: profileImageOnCloudinary.public_id,
            secure_url: profileImageOnCloudinary.secure_url
        };
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: newData
        },
        {
            returnDocument: "after",
        }
    );

    return API_Response.ok(res, "User details updated", {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        profileImageURL: updatedUser.profileImage?.secure_url
    });
};

export {
    signup,
    signin,
    logout,
    forgotPassword,
    resetPassword,
    updatePassword,
    getUserDashboard,
    updateUserDetails,
};
