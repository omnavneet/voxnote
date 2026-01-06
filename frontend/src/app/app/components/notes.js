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
                    <img src={url} className="max-w-full rounded-2xl border border-gray-200 shadow-sm" alt="attachment" />
                    <button onClick={() => setFullscreen({ url, mimetype })} className="absolute top-3 right-3 p-2.5 rounded-xl bg-white/90 backdrop-blur-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <Maximize2 size={16} className="text-gray-700" strokeWidth={2} />
                    </button>
                </div>
            );
        }

        if (mimetype === "application/pdf") {
            return (
                <div className="relative group">
                    <embed src={url} type="application/pdf" className="w-full h-96 rounded-2xl border border-gray-200 bg-gray-50 shadow-sm" />
                    <button onClick={() => setFullscreen({ url, mimetype })} className="absolute top-3 right-3 p-2.5 rounded-xl bg-white/90 backdrop-blur-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <Maximize2 size={16} className="text-gray-700" strokeWidth={2} />
                    </button>
                </div>
            );
        }

        return (
            <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 px-5 py-3 text-sm bg-gray-100 border border-gray-200 rounded-2xl hover:bg-gray-200 transition-all text-gray-700 font-semibold shadow-sm">
                <Upload size={16} strokeWidth={2} />
                Download Attachment
            </a>
        );
    }

    return (
        <div className="space-y-5 md:space-y-6">
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium shadow-sm"
                >
                    {error}
                </motion.div>
            )}

            <AnimatePresence>
                {fullscreen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-6"
                        onClick={() => setFullscreen(null)}
                    >
                        <button onClick={() => setFullscreen(null)} className="absolute top-6 right-6 p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 transition-all">
                            <Minimize2 size={20} className="text-white" strokeWidth={2} />
                        </button>
                        <div className="w-full max-w-[95vw] h-full max-h-[95vh] flex items-center justify-center">
                            {fullscreen.mimetype === "application/pdf" ? (
                                <embed src={fullscreen.url} type="application/pdf" className="w-full h-full rounded-2xl" />
                            ) : fullscreen.mimetype.startsWith("image/") ? (
                                <img src={fullscreen.url} className="max-w-full max-h-full rounded-2xl object-contain" alt="fullscreen" />
                            ) : (
                                <a href={fullscreen.url} target="_blank" className="text-white">Open attachment</a>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex flex-col md:flex-row gap-3 items-stretch">
                <motion.button
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowCreate(!showCreate)}
                    className="flex items-center justify-center gap-2.5 px-6 py-3.5 text-sm bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg shadow-indigo-300/50 hover:shadow-xl hover:shadow-indigo-400/60 transition-all text-white font-bold"
                >
                    <Plus size={18} strokeWidth={2.5} />
                    New Note
                </motion.button>

                <div className="flex-1 space-y-3">
                    <div className="flex gap-2.5">
                        <input
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && askQuestion()}
                            className="flex-1 text-sm px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder:text-gray-400 text-gray-800 font-medium transition-all"
                            placeholder="Ask about your notes..."
                        />
                        <motion.button
                            whileHover={{ scale: 1.03, y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={askQuestion}
                            disabled={asking}
                            className="px-5 md:px-6 py-3.5 text-sm bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-lg shadow-purple-300/50 hover:shadow-xl hover:shadow-purple-400/60 transition-all text-white font-bold disabled:opacity-50"
                        >
                            <Send size={18} strokeWidth={2.5} className="md:hidden" />
                            <span className="hidden md:inline">{asking ? "..." : "Ask"}</span>
                        </motion.button>
                    </div>

                    <AnimatePresence>
                        {answer && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="relative px-5 md:px-6 py-4 md:py-5 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-3xl shadow-sm"
                            >
                                <button onClick={() => setAnswer("")} className="absolute top-3 right-3 p-2 rounded-xl hover:bg-white/50 transition-all">
                                    <X size={16} className="text-gray-500" strokeWidth={2} />
                                </button>
                                <div className="flex items-start gap-3 md:gap-4 pr-8">
                                    <div className="mt-0.5 p-2.5 rounded-xl bg-purple-100 border border-purple-200 shadow-sm">
                                        <Sparkles size={18} className="text-purple-600" strokeWidth={2} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs uppercase tracking-wider text-purple-600 mb-2 font-bold">
                                            AI Answer
                                        </p>
                                        <p className="text-sm leading-relaxed text-gray-800 font-medium">{answer}</p>
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
                        <div className="bg-white/90 backdrop-blur-xl border border-gray-200/60 rounded-3xl p-5 md:p-6 space-y-4 shadow-lg">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-gray-600 tracking-wide">Create New Note</h3>
                                <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                                    <X size={18} className="text-gray-500" strokeWidth={2} />
                                </button>
                            </div>

                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full text-sm px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-gray-400 text-gray-800 font-medium transition-all"
                                placeholder="Note title..."
                            />

                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="w-full text-sm px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-gray-400 text-gray-800 font-medium resize-none transition-all"
                                placeholder="Note content..."
                                rows={6}
                            />

                            <div className="flex flex-col md:flex-row gap-3">
                                <label className="flex-1 flex items-center justify-center gap-2.5 px-4 py-3.5 text-sm bg-gray-100 border border-gray-200 rounded-2xl hover:bg-gray-200 transition-all text-gray-700 font-semibold cursor-pointer shadow-sm">
                                    <Upload size={16} strokeWidth={2} />
                                    {file ? file.name : "Attach File"}
                                    <input type="file" onChange={(e) => setFile(e.target.files[0])} className="hidden" />
                                </label>

                                <motion.button
                                    whileHover={{ scale: 1.03, y: -2 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={summarize}
                                    disabled={summarizing}
                                    className="flex items-center justify-center gap-2.5 px-5 py-3.5 text-sm bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-lg shadow-purple-300/50 hover:shadow-xl hover:shadow-purple-400/60 transition-all text-white font-bold disabled:opacity-50"
                                >
                                    <Sparkles size={16} strokeWidth={2.5} className={summarizing ? "animate-spin" : ""} />
                                    {summarizing ? "..." : "Summarize"}
                                </motion.button>
                            </div>

                            {summary && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-5 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 shadow-inner"
                                >
                                    <p className="text-xs uppercase tracking-wide text-purple-600 mb-2 font-bold">AI Summary</p>
                                    <p className="text-sm text-gray-800 leading-relaxed font-medium">{summary}</p>
                                </motion.div>
                            )}

                            <motion.button
                                whileHover={{ scale: 1.03, y: -2 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={createNote}
                                disabled={creating}
                                className="w-full py-3.5 text-sm bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg shadow-indigo-300/50 hover:shadow-xl hover:shadow-indigo-400/60 transition-all text-white font-bold disabled:opacity-50"
                            >
                                {creating ? "Saving..." : "Save Note"}
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-5">
                <div className="bg-white/90 backdrop-blur-xl border border-gray-200/60 rounded-3xl p-5 md:p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-sm font-semibold text-gray-600 tracking-wide">
                            All Notes
                        </h3>
                        <div className="px-3 py-1.5 bg-indigo-100 rounded-full">
                            <span className="text-xs font-bold text-indigo-700">{notes.length}</span>
                        </div>
                    </div>
                    <div className="space-y-2.5 max-h-[400px] md:max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {notes.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100 border border-indigo-200 flex items-center justify-center mx-auto mb-4 shadow-sm">
                                    <FileText size={22} className="text-indigo-600" strokeWidth={2} />
                                </div>
                                <p className="text-sm text-gray-500 font-medium">
                                    No notes yet
                                </p>
                            </div>
                        ) : (
                            notes.map((note) => (
                                <div
                                    key={note.noteId}
                                    className={`flex items-start gap-3 px-4 py-3.5 rounded-2xl transition-all group cursor-pointer ${selected?.noteId === note.noteId
                                        ? "bg-indigo-50 border border-indigo-100 shadow-sm"
                                        : "hover:bg-gray-50 border border-transparent"
                                        }`}
                                >
                                    <button onClick={() => openNote(note.noteId)} className="flex items-start gap-3 flex-1 text-left">
                                        <FileText
                                            size={18}
                                            className={`mt-0.5 flex-shrink-0 ${selected?.noteId === note.noteId ? "text-indigo-600" : "text-gray-400"
                                                }`}
                                            strokeWidth={2}
                                        />
                                        <p className="text-sm text-gray-800 font-medium leading-relaxed">{note.title}</p>
                                    </button>

                                    {deleteConfirm === note.noteId ? (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => deleteNote(note.noteId)}
                                                disabled={deletingId === note.noteId}
                                                className="px-3 py-1.5 text-xs bg-red-100 border border-red-200 rounded-xl text-red-600 font-bold hover:bg-red-200 transition-all disabled:opacity-50"
                                            >
                                                Delete
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirm(null)}
                                                className="px-3 py-1.5 text-xs bg-gray-100 border border-gray-200 rounded-xl text-gray-600 font-bold hover:bg-gray-200 transition-all"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setDeleteConfirm(note.noteId)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-gray-200 rounded-xl"
                                        >
                                            <Trash2 size={16} className="text-gray-500 hover:text-red-500" strokeWidth={2} />
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="bg-white/90 backdrop-blur-xl border border-gray-200/60 rounded-3xl p-5 md:p-6 shadow-lg">
                    <h3 className="text-sm font-semibold text-gray-600 tracking-wide mb-5">Note Details</h3>
                    {selected ? (
                        <div className="space-y-6 max-h-[400px] md:max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            <div>
                                <p className="text-xs text-gray-500 mb-3 uppercase tracking-wide font-bold">Title</p>
                                <p className="text-lg md:text-xl text-gray-800 font-bold leading-relaxed">{selected.title}</p>
                            </div>

                            {selected.content && (
                                <div>
                                    <p className="text-xs text-gray-500 mb-3 uppercase tracking-wide font-bold">Content</p>
                                    <p className="text-sm md:text-base text-gray-700 leading-relaxed font-medium whitespace-pre-wrap">{selected.content}</p>
                                </div>
                            )}

                            {selected.summary && (
                                <div>
                                    <p className="text-xs text-gray-500 mb-3 uppercase tracking-wide font-bold">Summary</p>
                                    <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 shadow-inner">
                                        <p className="text-sm md:text-base text-gray-800 leading-relaxed font-medium">{selected.summary}</p>
                                    </div>
                                </div>
                            )}

                            {selected.attachment && (
                                <div>
                                    <p className="text-xs text-gray-500 mb-3 uppercase tracking-wide font-bold">Attachment</p>
                                    {renderAttachment(selected)}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200 flex items-center justify-center mx-auto mb-5 shadow-sm">
                                <FileText size={28} className="text-gray-400" strokeWidth={2} />
                            </div>
                            <p className="text-sm text-gray-500 font-medium">
                                Select a note to view details
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(243, 244, 246, 0.5);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(156, 163, 175, 0.5);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(107, 114, 128, 0.7);
                }
            `}</style>
        </div>
    );
}