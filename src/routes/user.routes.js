import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import { customRole } from "../middlewares/role.middleware.js";
import {
    signup, signin, logout,
    forgotPassword, resetPassword, updatePassword,
    getUserDashboard, updateUserDetails, adminGetAllUsers, managerGetAllUsers,
    adminGetUserById, adminUpdateUserById, adminDeleteUserById,
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
router.post(
    "/userdashboard/update",
    upload.single("newProfileImage"),
    isLoggedIn,
    updateUserDetails
);

// admin routes
router.get("/admin/users", isLoggedIn, customRole("admin"), adminGetAllUsers,);
router.get("/admin/users/:userId", isLoggedIn, customRole("admin"), adminGetUserById);
router.put("/admin/users/:userId", isLoggedIn, customRole("admin"), adminGetUserById);
router.delete("/admin/users/:userId", isLoggedIn, customRole("admin"), adminDeleteUserById);

// manager routes
router.get("/manager/users", isLoggedIn, customRole("manager"), managerGetAllUsers,);

export default router;
