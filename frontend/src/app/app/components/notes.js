"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, FileText, Sparkles, X, Trash2, Maximize2, Minimize2, Upload } from "lucide-react";

export default function NotesPage() {
    const [notes, setNotes] = useState([]);
    const [selected, setSelected] = useState(null);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [type, setType] = useState("text");
    const [file, setFile] = useState(null);
    const [summary, setSummary] = useState("");
    const [showCreate, setShowCreate] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);

    useEffect(() => {
        fetch("http://localhost:5000/notes", { credentials: "include" })
            .then((r) => r.json())
            .then(setNotes)
            .catch(err => console.error("Failed to load notes:", err));
    }, []);

    function openNote(id) {
        fetch(`http://localhost:5000/notes/${id}`, { credentials: "include" })
            .then((r) => r.json())
            .then(setSelected)
            .catch(err => console.error("Failed to open note:", err));
    }

    function createNote() {
        if (!title.trim()) return;

        const form = new FormData();
        form.append("title", title);
        form.append("content", content);
        form.append("type", type);
        if (file) form.append("file", file);

        fetch("http://localhost:5000/notes", {
            method: "POST",
            credentials: "include",
            body: form,
        })
            .then((r) => r.json())
            .then((note) => {
                setNotes((n) => [note, ...n]);
                setTitle("");
                setContent("");
                setFile(null);
                setSummary("");
                setShowCreate(false);
            })
            .catch(err => {
                console.error("Failed to create note:", err);
                alert("Failed to create note");
            });
    }

    function summarize() {
        if (!content.trim()) return;

        fetch("http://localhost:5000/notes/summarize", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content }),
        })
            .then((r) => r.json())
            .then((d) => setSummary(d.summary))
            .catch(err => console.error("Failed to summarize:", err));
    }

    function deleteNote(id) {
        if (!confirm("Delete this note?")) return;

        fetch(`http://localhost:5000/notes/${id}`, {
            method: "DELETE",
            credentials: "include",
        }).then(() => {
            setNotes((n) => n.filter((x) => x.noteId !== id));
            if (selected?.noteId === id) setSelected(null);
        })
            .catch(err => console.error("Failed to delete note:", err));
    }

    function renderAttachment(note) {
        if (!note.attachment) return null;
        const url = note.attachment.url;
        const mime = note.attachment.mimetype;

        if (mime.startsWith("image/")) {
            return (
                <div className="relative group">
                    <img src={url} className="max-w-full rounded-xl border border-white/10" alt="attachment" />
                    <button
                        onClick={() => setFullscreen(url)}
                        className="absolute top-2 right-2 p-2 rounded-lg bg-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Maximize2 size={14} className="text-white" strokeWidth={1.5} />
                    </button>
                </div>
            );
        }

        if (mime === "application/pdf") {
            return (
                <div className="relative group">
                    <iframe src={url} className="w-full h-96 rounded-xl border border-white/10 bg-white/5" />
                    <button
                        onClick={() => setFullscreen(url)}
                        className="absolute top-2 right-2 p-2 rounded-lg bg-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Maximize2 size={14} className="text-white" strokeWidth={1.5} />
                    </button>
                </div>
            );
        }

        return (
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs border border-white/20 rounded-xl hover:bg-white/5 transition-all text-slate-300 font-light"
            >
                <Upload size={14} strokeWidth={1.5} />
                Download Attachment
            </a>
        );
    }

    return (
        <div className="space-y-6">
            {/* Fullscreen Modal */}
            <AnimatePresence>
                {fullscreen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-8"
                        onClick={() => setFullscreen(false)}
                    >
                        <button
                            onClick={() => setFullscreen(false)}
                            className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all"
                        >
                            <Minimize2 size={20} className="text-white" strokeWidth={1.5} />
                        </button>
                        <div className="max-w-7xl max-h-full overflow-auto">
                            {fullscreen.endsWith('.pdf') ? (
                                <iframe src={fullscreen} className="w-full h-[90vh] rounded-xl" />
                            ) : (
                                <img src={fullscreen} className="max-w-full max-h-[90vh] rounded-xl" alt="fullscreen" />
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header Actions */}
            <div className="flex gap-3">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowCreate(!showCreate)}
                    className="flex items-center gap-2 px-4 py-2.5 text-xs border border-white/20 rounded-xl hover:bg-white/5 transition-all text-slate-300 font-light"
                >
                    <Plus size={14} strokeWidth={1.5} />
                    New Note
                </motion.button>
            </div>

            {/* Create Note Form */}
            <AnimatePresence>
                {showCreate && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-medium">
                                    Create New Note
                                </h3>
                                <button onClick={() => setShowCreate(false)}>
                                    <X size={14} className="text-slate-500 hover:text-slate-300" strokeWidth={1.5} />
                                </button>
                            </div>

                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full text-xs px-4 py-2.5 border border-white/20 rounded-xl focus:outline-none focus:border-orange-500/50 bg-white/5 placeholder:text-slate-500 text-slate-200 font-light backdrop-blur-sm"
                                placeholder="Note title..."
                            />

                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="w-full text-xs px-4 py-2.5 border border-white/20 rounded-xl focus:outline-none focus:border-orange-500/50 bg-white/5 placeholder:text-slate-500 text-slate-200 font-light backdrop-blur-sm resize-none"
                                placeholder="Note content..."
                                rows={6}
                            />

                            <div className="flex gap-3">
                                <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs border border-white/20 rounded-xl hover:bg-white/5 transition-all text-slate-300 font-light cursor-pointer">
                                    <Upload size={14} strokeWidth={1.5} />
                                    {file ? file.name : "Attach File"}
                                    <input
                                        type="file"
                                        onChange={(e) => setFile(e.target.files[0])}
                                        className="hidden"
                                    />
                                </label>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={summarize}
                                    className="flex items-center gap-2 px-4 py-2.5 text-xs border border-purple-500/30 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 transition-all text-purple-400 font-light"
                                >
                                    <Sparkles size={14} strokeWidth={1.5} />
                                    Summarize
                                </motion.button>
                            </div>

                            {summary && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20"
                                >
                                    <p className="text-[10px] uppercase tracking-wide text-purple-400 mb-2">AI Summary</p>
                                    <p className="text-xs text-slate-300 leading-relaxed font-light">{summary}</p>
                                </motion.div>
                            )}

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={createNote}
                                className="w-full py-2.5 text-xs border border-orange-500/30 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 transition-all text-orange-400 font-light"
                            >
                                Save Note
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Notes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Notes List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl"
                >
                    <h3 className="text-[10px] uppercase tracking-[0.15em] text-slate-400 mb-6 font-medium">
                        All Notes ({notes.length})
                    </h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {notes.length === 0 ? (
                            <p className="text-[11px] text-slate-500 text-center py-8 font-light">
                                No notes yet. Create one to get started.
                            </p>
                        ) : (
                            notes.map((note, idx) => (
                                <motion.div
                                    key={note.noteId}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className={`flex items-start gap-2 p-3 rounded-xl transition-all group ${selected?.noteId === note.noteId
                                            ? "bg-orange-500/10 border border-orange-500/20"
                                            : "hover:bg-white/5 border border-transparent"
                                        }`}
                                >
                                    <button
                                        onClick={() => openNote(note.noteId)}
                                        className="flex items-start gap-2 flex-1 text-left"
                                    >
                                        <FileText
                                            size={14}
                                            className={`mt-0.5 flex-shrink-0 ${selected?.noteId === note.noteId
                                                    ? "text-orange-400"
                                                    : "text-slate-500 group-hover:text-slate-400"
                                                }`}
                                            strokeWidth={1.5}
                                        />
                                        <p className="text-xs text-slate-300 font-light">
                                            {note.title}
                                        </p>
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteNote(note.noteId);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={12} className="text-slate-500 hover:text-red-400" strokeWidth={1.5} />
                                    </button>
                                </motion.div>
                            ))
                        )}
                    </div>
                </motion.div>

                {/* Note Detail */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl"
                >
                    <h3 className="text-[10px] uppercase tracking-[0.15em] text-slate-400 mb-6 font-medium">
                        Note Details
                    </h3>
                    {selected ? (
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            <div>
                                <p className="text-[10px] text-slate-500 mb-2 uppercase tracking-wide">
                                    Title
                                </p>
                                <p className="text-sm text-slate-200 font-light">{selected.title}</p>
                            </div>

                            {selected.content && (
                                <div>
                                    <p className="text-[10px] text-slate-500 mb-2 uppercase tracking-wide">
                                        Content
                                    </p>
                                    <p className="text-xs text-slate-300 leading-relaxed font-light whitespace-pre-wrap">
                                        {selected.content}
                                    </p>
                                </div>
                            )}

                            {selected.summary && (
                                <div>
                                    <p className="text-[10px] text-slate-500 mb-2 uppercase tracking-wide">
                                        Summary
                                    </p>
                                    <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                                        <p className="text-xs text-slate-300 leading-relaxed font-light">
                                            {selected.summary}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {selected.attachment && (
                                <div>
                                    <p className="text-[10px] text-slate-500 mb-2 uppercase tracking-wide">
                                        Attachment
                                    </p>
                                    {renderAttachment(selected)}
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-[11px] text-slate-500 text-center py-8 font-light">
                            Select a note to view details
                        </p>
                    )}
                </motion.div>
            </div>
        </div>
    );
}