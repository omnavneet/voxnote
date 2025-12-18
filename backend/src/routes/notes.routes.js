import express from "express";
import { fetchNotes, addNote, fetchNoteById } from "../controllers/notes.controller.js";
import { summarizeNote } from "../controllers/notes.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/summarize", requireAuth, summarizeNote);
router.get("/", requireAuth, fetchNotes);
router.post("/", requireAuth, addNote);
router.get("/:noteId", requireAuth, fetchNoteById);

export default router;
