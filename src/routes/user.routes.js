import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
    signup,
    signin
} from "../controllers/user.controller.js";

const router = Router();

router.post(
    "/signup",
    upload.single("profileImage"),
    signup
);
router.post("/signin", signin);

export default router;
