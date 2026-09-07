import "dotenv/config";
import { User } from "../models/user.model.js";
import { API_Error } from "../utils/api-error.js";
import jwt from "jsonwebtoken";

/**
 * @param {import("express").Request} req
 */
export const isLoggedIn = async (req, res, next) => {
    const accessToken = req.cookies["accessToken"] || req.headers["authorization"]?.replace("Bearer", "");
    if (!accessToken)
        throw API_Error.unauthorized("You must be logged in to access this page");

    const decodedToken = jwt.verify(accessToken, process.env.JWT_SECRET);
    if (!decodedToken)
        throw API_Error.badRequest("Invalid or expired token provided")

    req.user = await User.findById(decodedToken.id);
    next();
};
