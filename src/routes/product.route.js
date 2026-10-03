import { Router } from "express";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { customRole } from "../middlewares/role.middleware.js";
import {
    addProduct, getAllProducts, adminGetAllProducts,
    getOneProduct, adminDeleteOneProduct, adminUpdateOneProduct
} from "../controllers/product.controller.js";

const router = Router();

// user routes
router.get("/",isLoggedIn,getAllProducts);
router.get("/product/:id", isLoggedIn, getOneProduct);

// admin routes
router.post(
    "/add",
    isLoggedIn,
    customRole("admin"),
    upload.array("photos", 8),
    addProduct
);
router.get("/admin/products", isLoggedIn, customRole("admin"), adminGetAllProducts);
router
    .route("/admin/product/:id")
    .delete(isLoggedIn, customRole("admin"), adminDeleteOneProduct)
    .put(isLoggedIn, customRole("admin"), adminUpdateOneProduct);

export default router;
