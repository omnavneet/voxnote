import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { fetchTimetable, updateSlot, } from "../controllers/timetable.controller.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", fetchTimetable);
router.post("/", updateSlot);

export default router;
