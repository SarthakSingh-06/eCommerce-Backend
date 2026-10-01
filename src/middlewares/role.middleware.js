import { API_Error } from "../utils/api-error.js";

export const customRole = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            throw API_Error.forbidden("You are not allowed to access this resource");
        }
        next();
    };
};
