import { Router } from "express";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
    addProduct,
} from "../controllers/product.controller.js";

const router = Router();

router.post(
    "/",
    isLoggedIn,
    upload.array("photos", 12),
    addProduct
);

export default router;
