"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, FileText, Sparkles, X, Trash2, Maximize2, Minimize2, Upload, Send } from "lucide-react";

export default function NotesPage() {
    const [notes, setNotes] = useState([]);
    const [selected, setSelected] = useState(null);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [file, setFile] = useState(null);
    const [summary, setSummary] = useState("");
    const [showCreate, setShowCreate] = useState(false);
    const [fullscreen, setFullscreen] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");

    const [asking, setAsking] = useState(false);
    const [opening, setOpening] = useState(false);
    const [creating, setCreating] = useState(false);
    const [summarizing, setSummarizing] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/notes`, { credentials: "include" })
            .then((r) => r.json())
            .then(setNotes)
            .catch(() => setError("Failed to load notes"));
    }, []);

    async function askQuestion() {
        if (!question.trim() || asking) return;
        setAsking(true);
        setError("");
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rag/query`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question }),
            });
            const d = await res.json();
            if (!res.ok) throw new Error(d.error || "Failed to get answer");
            setAnswer(d.answer);
        } catch {
            setError("Failed to get answer");
        } finally {
            setAsking(false);
        }
    }

    async function openNote(id) {
        if (opening) return;
        setOpening(true);
        setError("");
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notes/${id}`, { credentials: "include" });
            const d = await res.json();
            if (!res.ok) throw new Error();
            setSelected(d);
        } catch {
            setError("Failed to load note");
        } finally {
            setOpening(false);
        }
    }

    async function createNote() {
        if (!title.trim() || creating) return;
        setCreating(true);
        setError("");

        const form = new FormData();
        form.append("title", title);
        form.append("content", content);
        form.append("type", "text");
        if (summary) form.append("summary", summary);
        if (file) form.append("file", file);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notes`, {
                method: "POST",
                credentials: "include",
                body: form,
            });
            const note = await res.json();
            if (!res.ok) throw new Error();
            setNotes((n) => [note, ...n]);
            setTitle("");
            setContent("");
            setFile(null);
            setSummary("");
            setShowCreate(false);
        } catch {
            setError("Failed to create note");
        } finally {
            setCreating(false);
        }
    }

    async function summarize() {
        if (!content.trim() || summarizing) return;
        setSummarizing(true);
        setError("");
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notes/summarize`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content }),
            });
            const d = await res.json();
            if (!res.ok) throw new Error();
            setSummary(d.summary);
        } catch {
            setError("Failed to summarize");
        } finally {
            setSummarizing(false);
        }
    }

    async function deleteNote(id) {
        if (deletingId) return;
        setDeletingId(id);
        setError("");
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notes/${id}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (!res.ok) throw new Error();
            setNotes((n) => n.filter((x) => x.noteId !== id));
            if (selected?.noteId === id) setSelected(null);
            setDeleteConfirm(null);
        } catch {
            setError("Failed to delete note");
        } finally {
            setDeletingId(null);
        }
    }

    function renderAttachment(note) {
        if (!note.attachment) return null;
        const { url, mimetype } = note.attachment;

        if (mimetype.startsWith("image/")) {
            return (
                <div className="relative group">
                    <img src={url} className="max-w-full rounded-xl border border-white/10" alt="attachment" />
                    <button onClick={() => setFullscreen({ url, mimetype })} className="absolute top-2 right-2 p-2 rounded-lg bg-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        <Maximize2 size={14} className="text-white" strokeWidth={1.5} />
                    </button>
                </div>
            );
        }

        if (mimetype === "application/pdf") {
            return (
                <div className="relative group">
                    <embed src={url} type="application/pdf" className="w-full h-96 rounded-xl border border-white/10 bg-white/5" />
                    <button onClick={() => setFullscreen({ url, mimetype })} className="absolute top-2 right-2 p-2 rounded-lg bg-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        <Maximize2 size={14} className="text-white" strokeWidth={1.5} />
                    </button>
                </div>
            );
        }

        return (
            <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 text-xs border border-white/20 rounded-xl hover:bg-white/5 transition-all text-slate-300 font-light">
                <Upload size={14} strokeWidth={1.5} />
                Download Attachment
            </a>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                    {error}
                </div>
            )}

            <AnimatePresence>
                {fullscreen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
                        onClick={() => setFullscreen(null)}
                    >
                        <button onClick={() => setFullscreen(null)} className="absolute top-4 md:top-6 right-4 md:right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all">
                            <Minimize2 size={20} className="text-white" strokeWidth={1.5} />
                        </button>
                        <div className="w-full max-w-[95vw] h-full max-h-[95vh] flex items-center justify-center">
                            {fullscreen.mimetype === "application/pdf" ? (
                                <embed src={fullscreen.url} type="application/pdf" className="w-full h-full rounded-xl" />
                            ) : fullscreen.mimetype.startsWith("image/") ? (
                                <img src={fullscreen.url} className="max-w-full max-h-full rounded-xl object-contain" alt="fullscreen" />
                            ) : (
                                <a href={fullscreen.url} target="_blank" className="text-white">Open attachment</a>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-start">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowCreate(!showCreate)}
                    className="flex items-center justify-center gap-2 px-4 md:px-5 py-2.5 text-xs border border-orange-500/30 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 transition-all text-orange-400 font-light"
                >
                    <Plus size={14} strokeWidth={1.5} />
                    New Note
                </motion.button>

                <div className="flex-1 space-y-3">
                    <div className="flex gap-2">
                        <input
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && askQuestion()}
                            className="flex-1 text-sm px-4 py-3 border border-white/20 rounded-xl focus:outline-none focus:border-purple-500/50 bg-white/5 placeholder:text-slate-500 text-slate-200 font-light backdrop-blur-sm"
                            placeholder="Ask about your notes..."
                        />
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={askQuestion}
                            className="px-4 md:px-5 py-3 text-xs border border-purple-500/30 rounded-xl bg-gradient-to-r from-purple-500/10 to-purple-600/10 hover:from-purple-500/20 hover:to-purple-600/20 transition-all text-purple-400 font-light"
                        >
                            <Send size={14} strokeWidth={1.5} className="md:hidden" />
                            <span className="hidden md:inline">Ask</span>
                        </motion.button>
                    </div>

                    <AnimatePresence>
                        {answer && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="relative px-4 md:px-6 py-3 md:py-4 bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl"
                            >
                                <button onClick={() => setAnswer("")} className="absolute top-2 md:top-3 right-2 md:right-3 p-1 rounded-lg hover:bg-white/10">
                                    <X size={14} className="text-slate-400" strokeWidth={1.5} />
                                </button>
                                <div className="flex items-start gap-2 md:gap-3 pr-6">
                                    <div className="mt-0.5 p-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
                                        <Sparkles size={14} className="text-purple-400" strokeWidth={1.5} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] uppercase tracking-wider text-purple-400/80 mb-2 font-medium">
                                            AI Answer
                                        </p>
                                        <p className="text-sm leading-relaxed text-slate-200 font-light">{answer}</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <AnimatePresence>
                {showCreate && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 md:p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-medium">Create New Note</h3>
                                <button onClick={() => setShowCreate(false)}>
                                    <X size={14} className="text-slate-500 hover:text-slate-300" strokeWidth={1.5} />
                                </button>
                            </div>

                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full text-xs px-4 py-2.5 border border-white/20 rounded-xl focus:outline-none focus:border-orange-500/50 bg-white/5 placeholder:text-slate-500 text-slate-200 font-light"
                                placeholder="Note title..."
                            />

                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="w-full text-xs px-4 py-2.5 border border-white/20 rounded-xl focus:outline-none focus:border-orange-500/50 bg-white/5 placeholder:text-slate-500 text-slate-200 font-light resize-none"
                                placeholder="Note content..."
                                rows={6}
                            />

                            <div className="flex flex-col md:flex-row gap-3">
                                <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs border border-white/20 rounded-xl hover:bg-white/5 transition-all text-slate-300 font-light cursor-pointer">
                                    <Upload size={14} strokeWidth={1.5} />
                                    {file ? file.name : "Attach File"}
                                    <input type="file" onChange={(e) => setFile(e.target.files[0])} className="hidden" />
                                </label>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={summarize}
                                    className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs border border-purple-500/30 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 transition-all text-purple-400 font-light"
                                >
                                    <Sparkles size={14} strokeWidth={1.5} />
                                    Summarize
                                </motion.button>
                            </div>

                            {summary && (
                                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                                    <p className="text-[10px] uppercase tracking-wide text-purple-400 mb-2">AI Summary</p>
                                    <p className="text-xs text-slate-300 leading-relaxed font-light">{summary}</p>
                                </div>
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

            <div className="grid grid-cols-1 md:grid-cols-[minmax(300px,380px)_1fr] gap-6 md:gap-8">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 md:p-8">
                    <h3 className="text-[10px] uppercase tracking-[0.15em] text-slate-400 mb-4 md:mb-6 font-light">
                        All Notes ({notes.length})
                    </h3>
                    <div className="space-y-3 max-h-[400px] md:max-h-[600px] overflow-y-auto">
                        {notes.length === 0 ? (
                            <p className="text-[11px] text-slate-500 text-center py-8 md:py-12 font-light">
                                No notes yet
                            </p>
                        ) : (
                            notes.map((note) => (
                                <div
                                    key={note.noteId}
                                    className={`flex items-start gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl transition-all group cursor-pointer ${selected?.noteId === note.noteId
                                        ? "bg-orange-500/10 border border-orange-500/20"
                                        : "hover:bg-white/5 border border-transparent"
                                        }`}
                                >
                                    <button onClick={() => openNote(note.noteId)} className="flex items-start gap-2 md:gap-3 flex-1 text-left">
                                        <FileText
                                            size={14}
                                            className={`mt-0.5 flex-shrink-0 ${selected?.noteId === note.noteId ? "text-orange-400" : "text-slate-500"
                                                }`}
                                            strokeWidth={1.5}
                                        />
                                        <p className="text-xs md:text-sm text-slate-300 font-light leading-relaxed">{note.title}</p>
                                    </button>

                                    {deleteConfirm === note.noteId ? (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => deleteNote(note.noteId)}
                                                className="px-2 py-1 text-[10px] bg-red-500/20 border border-red-500/30 rounded-lg text-red-400"
                                            >
                                                Confirm
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirm(null)}
                                                className="px-2 py-1 text-[10px] bg-white/5 border border-white/10 rounded-lg text-slate-400"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setDeleteConfirm(note.noteId)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                        >
                                            <Trash2 size={14} className="text-slate-500 hover:text-red-400" strokeWidth={1.5} />
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 md:p-8">
                    <h3 className="text-[10px] uppercase tracking-[0.15em] text-slate-400 mb-4 md:mb-6 font-light">Note Details</h3>
                    {selected ? (
                        <div className="space-y-6 max-h-[400px] md:max-h-[600px] overflow-y-auto">
                            <div>
                                <p className="text-[10px] text-slate-500 mb-2 md:mb-3 uppercase tracking-wide font-light">Title</p>
                                <p className="text-base md:text-lg text-slate-200 font-light leading-relaxed">{selected.title}</p>
                            </div>

                            {selected.content && (
                                <div>
                                    <p className="text-[10px] text-slate-500 mb-2 md:mb-3 uppercase tracking-wide font-light">Content</p>
                                    <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-light whitespace-pre-wrap">{selected.content}</p>
                                </div>
                            )}

                            {selected.summary && (
                                <div>
                                    <p className="text-[10px] text-slate-500 mb-2 md:mb-3 uppercase tracking-wide font-light">Summary</p>
                                    <div className="p-3 md:p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                                        <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-light">{selected.summary}</p>
                                    </div>
                                </div>
                            )}

                            {selected.attachment && (
                                <div>
                                    <p className="text-[10px] text-slate-500 mb-2 md:mb-3 uppercase tracking-wide font-light">Attachment</p>
                                    {renderAttachment(selected)}
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-[11px] text-slate-500 text-center py-8 md:py-12 font-light">
                            Select a note to view details
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}