import express from "express";
import { login, signup, verifyEmail, me, logout } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/signup", signup);
router.post("/verify-email", verifyEmail);
router.get("/me", requireAuth, me);
router.post("/logout", requireAuth, logout);

export default router;
