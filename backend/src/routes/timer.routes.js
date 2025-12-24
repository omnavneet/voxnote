import express from "express";
import { startFocus, stopFocus, today } from "../controllers/timer.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/start", requireAuth, startFocus);
router.post("/stop", requireAuth, stopFocus);
router.get("/today", requireAuth, today);

export default router;
