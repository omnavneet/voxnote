import express from "express";
import { queryRag } from "../controllers/rag.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(requireAuth);
router.post("/query", queryRag);

export default router;
