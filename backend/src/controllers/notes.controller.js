import { getAllNotes, createNote, getNoteById, deleteNote } from "../services/notes.store.js";
import { summarizeGraph } from "../graphs/summarize.graph.js";
import { summarizeAllNotes } from "../graphs/dashboardSummarize.graph.js";
import { deleteEmbedding, storeEmbedding } from "../services/embedding.service.js";
import { uploadFile, deleteFile, getSignedUrl } from "../services/files.service.js";
import { randomUUID } from "crypto";

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
    const { title, content, type, summary } = req.body;
    const file = req.file;

    if (!title || !content || !type) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const noteId = randomUUID();
    let attachment = null;

    // 1. Upload file if present
    if (file) {
      attachment = await uploadFile({ userId, noteId, file });
    }

    // 2. Save note to DB
    const savedNote = await createNote(userId, {
      noteId,
      title,
      content,
      type,
      attachment,
      summary: summary || null,
    });

    // 3. Generate embedding
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

    if (note.attachment?.key) {
      note.attachment.url = await getSignedUrl(note.attachment.key);
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

export async function deleteNoteById(req, res) {
  try {
    const userId = req.user.sub;
    const { noteId } = req.params;

    const note = await getNoteById(userId, noteId);
    if (!note) return res.status(404).json({ error: "Not found" });

    if (note.attachment?.key) {
      await deleteFile(note.attachment.key);
    }
    await deleteNote(userId, noteId);
    await deleteEmbedding(noteId, userId);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed" });
  }
}

export async function summarizeAll(req, res) {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: "content is required" });
    }

    const result = await summarizeAllNotes.invoke({
      text: content,
    });

    res.json({ summary: result.summary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Summarization failed" });
  }
}
