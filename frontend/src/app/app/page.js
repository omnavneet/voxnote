"use client";

import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [content, setContent] = useState("");
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Fetch notes when the page loads
  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    try {
      const res = await fetch("http://localhost:5000/notes", {
        credentials: "include",
      });
      const data = await res.json();
      // Ensure data is an array before setting state
      setNotes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch notes", err);
    }
  }

  async function addNote() {
    if (!content.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: "Temp note",
          content,
          type: "text",
        }),
      });

      if (res.ok) {
        const newNote = await res.json();
        setNotes((prev) => [newNote, ...prev]);
        setContent(""); // Clear input on success
      }
    } catch (err) {
      console.error("Failed to add note", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      <div className="flex gap-2 mb-6">
        <input
          className="border p-2 flex-1 rounded"
          placeholder="Write a note..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button
          onClick={addNote}
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          {loading ? "Saving..." : "Add"}
        </button>
      </div>

      <div className="space-y-3">
        {notes.length === 0 ? (
          <p className="text-gray-500">No notes yet</p>
        ) : (
          notes.map((note) => (
            <div key={note?.noteId || Math.random()} className="border p-3 rounded shadow-sm">
              <div className="text-xs text-gray-400">
                {note?.createdAt ? new Date(note.createdAt).toLocaleString() : "Just now"}
              </div>
              <div className="mt-1">{note?.content}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}