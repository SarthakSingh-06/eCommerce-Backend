import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import {
    signup,
    signin,
    logout,
    forgotPassword,
    resetPassword,
    updatePassword,
    getUserDashboard,
} from "../controllers/user.controller.js";

const router = Router();

// unsecure routes
router.post(
    "/signup",
    upload.single("profileImage"),
    signup
);
router.post("/signin", signin);
router.get("/logout", logout);
router.post("/forgotpassword", forgotPassword);
router.post("/resetpassword/:token", resetPassword);

// secure routes
router.post("/updatepassword", isLoggedIn, updatePassword);
router.get("/userdashboard", isLoggedIn, getUserDashboard);

export default router;
