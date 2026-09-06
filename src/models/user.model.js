import "dotenv/config";
import { Schema, model } from "mongoose";
import { hashSync, compareSync } from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomBytes, createHmac } from "node:crypto";

const userSchema = new Schema({
    name: {
        type: String,
        required: [true, "Please provide a name"],
        trim: true,
        maxLength: [50, "Name should not exceed 50 characters"]
    },
    email: {
        type: String,
        required: [true, "Please provide an email"],
        trim: true,
        unique: true,
        lowercase: true,
        maxLength: 322,
    },
    password: {
        type: String,
        required: [true, "Please provide a password"],
        minLength: [8, "Password must be atleast 8 characters long"],
        select: false
    },
    role: {
        type: String,
        default: "user",
    },
    profileImage: {
        id: {
            type: String,
            required: true,
        },
        secure_url: {
            type: String,
            required: true,
        },
    },
    forgotPasswordToken: {
        type: String,
        select: false
    },
    forgotPasswordExpiry: {
        type: Date,
        select: false
    }
}, {
    timestamps: true
});

// encrypt password before saving it to database
userSchema.pre("save", function() {
    if (!this.isModified("password")) return;
    this.password = hashSync(this.password, 12);
});

userSchema.methods.isPasswordCorrect = function(password) {
    const result = compareSync(password, this.password);
    return result;
};

userSchema.methods.getJWT_Token = function() {
    const token = jwt.sign(
        { id: this._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_TOKEN_EXPIRY }
    );
    return token;
};

// generate forgot password token
userSchema.methods.getForgotPasswordToken = function() {
    const token = randomBytes(32).toString("hex");
    const hashedToken = createHmac("sha256", token).digest("hex");
    this.forgotPasswordToken = hashedToken;

    // token will be valid for 20 mins
    this.forgotPasswordExpiry = Date.now() + (20 * 60 * 1000);
    return token;
};

export const User = model("User", userSchema);
