import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
    signup,
    signin,
    logout,
} from "../controllers/user.controller.js";

const router = Router();

router.post(
    "/signup",
    upload.single("profileImage"),
    signup
);
router.post("/signin", signin);
router.get("/logout", logout);

export default router;
