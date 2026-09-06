import { User } from "../models/user.model.js";
import { API_Error } from "../utils/api-error.js";
import { API_Response } from "../utils/api-response.js";
import { uploadImageOnCloudinary } from "../utils/cloudinary.js";
import {
    sendEmail,
    generateForgotPasswordMail
} from "../utils/email.js";
import {
    signupValidationSchema,
    signinValidationSchema,
    forgotPasswordValidationSchema,
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

export {
    signup,
    signin,
    logout,
    forgotPassword,
};
