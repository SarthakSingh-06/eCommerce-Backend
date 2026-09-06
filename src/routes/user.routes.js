import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
    signup,
    signin,
    logout,
    forgotPassword,
    resetPassword
} from "../controllers/user.controller.js";

const router = Router();

router.post(
    "/signup",
    upload.single("profileImage"),
    signup
);
router.post("/signin", signin);
router.get("/logout", logout);
router.post("/forgotpassword", forgotPassword);
router.post("/resetpassword/:token", resetPassword);

export default router;
