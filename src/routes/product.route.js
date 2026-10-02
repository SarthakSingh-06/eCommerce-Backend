import { Router } from "express";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { customRole } from "../middlewares/role.middleware.js";
import {
    addProduct, getAllProducts
} from "../controllers/product.controller.js";

const router = Router();

// user routes
router.get(
    "/",
    isLoggedIn,
    getAllProducts
);

// admin routes
router.post(
    "/add",
    isLoggedIn,
    customRole("admin"),
    upload.array("photos", 8),
    addProduct
);

export default router;
