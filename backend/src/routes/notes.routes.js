import express from "express";
import { fetchNotes, addNote } from "../controllers/notes.controller.js";
import { summarizeNote } from "../controllers/notes.controller.js";

const router = express.Router();

router.post("/summarize", summarizeNote);
router.get("/", fetchNotes);
router.post("/", addNote);

export default router;
