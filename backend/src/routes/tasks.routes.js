import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { fetchTasks, addTask, removeTask, } from "../controllers/tasks.controller.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", fetchTasks);
router.post("/", addTask);
router.delete("/:taskId", removeTask);

export default router;
