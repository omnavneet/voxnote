import express from "express";
import { fetchNotes, addNote, fetchNoteById, deleteNoteById } from "../controllers/notes.controller.js";
import { summarizeNote } from "../controllers/notes.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = express.Router();

router.use(requireAuth);
router.post("/summarize", summarizeNote);
router.get("/", fetchNotes);
router.post("/", upload.single("file"), addNote);
router.get("/:noteId", fetchNoteById);
router.delete("/:noteId", deleteNoteById);

export default router;
