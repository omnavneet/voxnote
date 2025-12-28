import express from "express";
import { login, signup, verifyEmail, me, logout, changePassword, forgotPassword, confirmPassword, deleteUser } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/signup", signup);
router.post("/verify-email", verifyEmail);
router.get("/me", requireAuth, me);
router.post("/logout", requireAuth, logout);
router.post("/change-password", requireAuth, changePassword);
router.post("/forgot-password", forgotPassword);
router.post("/confirm-password", confirmPassword);
router.delete("/delete-user", requireAuth, deleteUser);

export default router;
