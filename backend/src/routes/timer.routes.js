import express from "express";
import { startFocus, stopFocus } from "../controllers/timer.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

router.post("/start", requireAuth, startFocus);
router.post("/stop", requireAuth, stopFocus);

export default router;
