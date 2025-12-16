import { getAllNotes, createNote } from "../services/notes.store.js";
import { summarizeGraph } from "../graphs/summarize.graph.js";
import { storeEmbedding } from "../services/embedding.service.js";
import crypto from "crypto";

export function fetchNotes(req, res) {
  const userId = "demo-user"; // temporary 
  const notes = getAllNotes(userId);
  res.json(notes);
}

export async function addNote(req, res) {
  const userId = "demo-user"; // temporary
  const { title, content, type } = req.body;

  const note = {
    noteId: crypto.randomUUID(),
    userId,
    title,
    content,
    type,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    embeddingId: null,
    metadata: {}
  };

  const savedNote = createNote(note);
  await storeEmbedding(savedNote);
  res.status(201).json(savedNote);
}

export async function summarizeNote(req, res) {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: "content is required" });
    }

    const result = await summarizeGraph.invoke({
      text: content
    });

    res.json({ summary: result.summary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Summarization failed" });
  }
}

