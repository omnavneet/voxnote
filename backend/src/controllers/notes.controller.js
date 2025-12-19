import { getAllNotes, createNote, getNoteById } from "../services/notes.store.js";
import { summarizeGraph } from "../graphs/summarize.graph.js";
import { storeEmbedding } from "../services/embedding.service.js";

export async function fetchNotes(req, res) {
  try {
    const userId = req.user?.sub; 
    const notes = await getAllNotes(userId);
    res.json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
}

export async function addNote(req, res) {
  try {
    const userId = req.user?.sub;
    const { title, content, type, fileUrl } = req.body;

    if (!title || !content || !type) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 1. Save note to DB
    const savedNote = await createNote(userId, {
      title,
      content,
      type,
      fileUrl,
    });

    // 2. Generate embedding (non-blocking mindset)
    await storeEmbedding(savedNote);

    res.status(201).json(savedNote);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create note" });
  }
}

export async function fetchNoteById(req, res) {
  try {
    const userId = req.user?.sub;
    const { noteId } = req.params;
    const note = await getNoteById(userId, noteId);
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }
    res.json(note);
  } catch (err) {
    console.error(err); 
    res.status(500).json({ error: "Failed to fetch note" });
  }
}

export async function summarizeNote(req, res) {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: "content is required" });
    }

    const result = await summarizeGraph.invoke({
      text: content,
    });

    res.json({ summary: result.summary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Summarization failed" });
  }
}
