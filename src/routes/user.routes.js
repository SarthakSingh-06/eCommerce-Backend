import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
    signup
} from "../controllers/user.controller.js";

const router = Router();

router.post(
    "/signup",
    upload.single("profileImage"),
    signup
);

export default router;
