"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, FileText, Sparkles, X, Trash2, Maximize2, Minimize2, Upload, Send, Search } from "lucide-react";

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
                <div className="relative group mt-4">
                    <div className="rounded-xl border-2 border-[#2D2B28] overflow-hidden shadow-[4px_4px_0px_0px_#2D2B28] bg-white">
                        <img src={url} className="max-w-full object-cover" alt="attachment" />
                    </div>
                    <button
                        onClick={() => setFullscreen({ url, mimetype })}
                        className="absolute top-3 right-3 p-2 rounded-lg bg-[#FAF5EE] border-2 border-[#2D2B28] shadow-[2px_2px_0px_0px_#2D2B28] opacity-0 group-hover:opacity-100 transition-all hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#2D2B28]"
                    >
                        <Maximize2 size={16} className="text-[#2D2B28]" strokeWidth={2.5} />
                    </button>
                </div>
            );
        }

        if (mimetype === "application/pdf") {
            return (
                <div className="relative group mt-4">
                    <embed src={url} type="application/pdf" className="w-full h-96 rounded-xl border-2 border-[#2D2B28] bg-[#FAF5EE] shadow-[4px_4px_0px_0px_#2D2B28]" />
                    <button
                        onClick={() => setFullscreen({ url, mimetype })}
                        className="absolute top-3 right-3 p-2 rounded-lg bg-[#FAF5EE] border-2 border-[#2D2B28] shadow-[2px_2px_0px_0px_#2D2B28] opacity-0 group-hover:opacity-100 transition-all hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#2D2B28]"
                    >
                        <Maximize2 size={16} className="text-[#2D2B28]" strokeWidth={2.5} />
                    </button>
                </div>
            );
        }

        return (
            <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 px-5 py-3 mt-4 text-sm bg-[#FFF9E6] border-2 border-[#2D2B28] rounded-xl hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_#2D2B28] transition-all text-[#2D2B28] font-bold shadow-[2px_2px_0px_0px_#2D2B28]">
                <Upload size={18} strokeWidth={2.5} />
                Download Attachment
            </a>
        );
    }

    return (
        <div className="space-y-6 md:space-y-8 pb-8">
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-[#E8503A] border-2 border-[#2D2B28] text-white font-bold shadow-[4px_4px_0px_0px_#2D2B28]"
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
                        className="fixed inset-0 z-[100] bg-[#2D2B28]/95 backdrop-blur-sm flex items-center justify-center p-6"
                        onClick={() => setFullscreen(null)}
                    >
                        <button
                            onClick={() => setFullscreen(null)}
                            className="absolute top-6 right-6 p-3 rounded-xl bg-[#E8503A] border-2 border-[#FAF5EE] hover:bg-[#FFC94D] hover:text-[#2D2B28] transition-all text-[#FAF5EE]"
                        >
                            <Minimize2 size={24} strokeWidth={2.5} />
                        </button>
                        <div className="w-full max-w-[90vw] h-full max-h-[90vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                            {fullscreen.mimetype === "application/pdf" ? (
                                <embed src={fullscreen.url} type="application/pdf" className="w-full h-full rounded-2xl border-4 border-[#FAF5EE]" />
                            ) : fullscreen.mimetype.startsWith("image/") ? (
                                <img src={fullscreen.url} className="max-w-full max-h-full rounded-2xl border-4 border-[#FAF5EE] object-contain" alt="fullscreen" />
                            ) : (
                                <a href={fullscreen.url} target="_blank" className="text-[#FAF5EE] text-xl font-bold underline decoration-4 underline-offset-4 hover:text-[#FFC94D]">Open attachment</a>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex flex-col md:flex-row gap-4 items-stretch">

                <div className="flex-1 space-y-4">
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <input
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && askQuestion()}
                                className="w-full text-sm px-4 py-4 pl-11 bg-[#FAF5EE] border-2 border-[#2D2B28] rounded-xl focus:outline-none focus:shadow-[4px_4px_0px_0px_#2D2B28] placeholder:text-[#2D2B28]/40 text-[#2D2B28] font-bold transition-all"
                                placeholder="Ask AI about your notes..."
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2D2B28]/50" size={18} strokeWidth={2.5} />
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.02, y: -2, boxShadow: "4px 4px 0px 0px #2D2B28" }}
                            whileTap={{ scale: 0.98, y: 0, boxShadow: "0px 0px 0px 0px #2D2B28" }}
                            onClick={askQuestion}
                            disabled={asking}
                            className="px-6 py-4 text-sm bg-[#6A0572] border-2 border-[#2D2B28] rounded-xl shadow-[2px_2px_0px_0px_#2D2B28] transition-all text-[#FAF5EE] font-black uppercase disabled:opacity-50"
                        >
                            <Send size={18} strokeWidth={2.5} className="md:hidden" />
                            <span className="hidden md:inline">{asking ? "..." : "Ask"}</span>
                        </motion.button>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02, y: -2, boxShadow: "4px 4px 0px 0px #2D2B28" }}
                        whileTap={{ scale: 0.98, y: 0, boxShadow: "0px 0px 0px 0px #2D2B28" }}
                        onClick={() => setShowCreate(!showCreate)}
                        className="flex items-center justify-center gap-3 px-6 py-4 text-sm bg-[#4ECDC4] border-2 border-[#2D2B28] rounded-xl shadow-[2px_2px_0px_0px_#2D2B28] transition-all text-[#2D2B28] font-black uppercase tracking-wide whitespace-nowrap"
                    >
                        <Plus size={20} strokeWidth={3} />
                        New Note
                    </motion.button>

                    <AnimatePresence>
                        {answer && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="relative px-6 py-5 bg-[#E6F9F5] border-2 border-[#2D2B28] rounded-2xl shadow-[4px_4px_0px_0px_#2D2B28]">
                                    <button
                                        onClick={() => setAnswer("")}
                                        className="absolute top-3 right-3 p-1.5 rounded-lg border-2 border-transparent hover:border-[#2D2B28] hover:bg-[#FAF5EE] transition-all"
                                    >
                                        <X size={18} className="text-[#2D2B28]" strokeWidth={2.5} />
                                    </button>
                                    <div className="flex items-start gap-4 pr-8">
                                        <div className="mt-1 p-2 rounded-lg bg-[#4ECDC4] border-2 border-[#2D2B28] shadow-[2px_2px_0px_0px_#2D2B28]">
                                            <Sparkles size={18} className="text-[#2D2B28]" strokeWidth={2.5} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs uppercase tracking-widest text-[#2D2B28] mb-2 font-black">
                                                AI Answer
                                            </p>
                                            <p className="text-sm leading-relaxed text-[#2D2B28] font-medium">{answer}</p>
                                        </div>
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
                        initial={{ opacity: 0, height: 0, scale: 0.95 }}
                        animate={{ opacity: 1, height: "auto", scale: 1 }}
                        exit={{ opacity: 0, height: 0, scale: 0.95 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-[#FFF9E6] border-2 border-[#2D2B28] rounded-3xl p-6 md:p-8 space-y-5 shadow-[6px_6px_0px_0px_#2D2B28]">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-black text-[#2D2B28] uppercase tracking-wide">Create New Note</h3>
                                <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-[#E8503A] hover:text-white border-2 border-transparent hover:border-[#2D2B28] rounded-xl transition-all">
                                    <X size={20} strokeWidth={2.5} />
                                </button>
                            </div>

                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full text-base px-4 py-3 bg-[#FAF5EE] border-2 border-[#2D2B28] rounded-xl focus:outline-none focus:shadow-[4px_4px_0px_0px_#2D2B28] placeholder:text-[#2D2B28]/40 text-[#2D2B28] font-bold transition-all"
                                placeholder="Note title..."
                            />

                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="w-full text-base px-4 py-3 bg-[#FAF5EE] border-2 border-[#2D2B28] rounded-xl focus:outline-none focus:shadow-[4px_4px_0px_0px_#2D2B28] placeholder:text-[#2D2B28]/40 text-[#2D2B28] font-medium resize-none transition-all min-h-[150px]"
                                placeholder="Start writing..."
                                rows={6}
                            />

                            <div className="flex flex-col md:flex-row gap-4">
                                <label className="flex-1 flex items-center justify-center gap-3 px-5 py-3.5 text-sm bg-[#FAF5EE] border-2 border-[#2D2B28] rounded-xl hover:bg-[#FFC94D] transition-all text-[#2D2B28] font-bold cursor-pointer shadow-[2px_2px_0px_0px_#2D2B28] hover:shadow-[3px_3px_0px_0px_#2D2B28] active:translate-y-[2px] active:shadow-none">
                                    <Upload size={18} strokeWidth={2.5} />
                                    {file ? file.name : "Attach File"}
                                    <input type="file" onChange={(e) => setFile(e.target.files[0])} className="hidden" />
                                </label>

                                <motion.button
                                    whileHover={{ scale: 1.02, y: -2, boxShadow: "4px 4px 0px 0px #2D2B28" }}
                                    whileTap={{ scale: 0.98, y: 0, boxShadow: "0px 0px 0px 0px #2D2B28" }}
                                    onClick={summarize}
                                    disabled={summarizing}
                                    className="flex items-center justify-center gap-3 px-6 py-3.5 text-sm bg-[#FF9F1C] border-2 border-[#2D2B28] rounded-xl shadow-[2px_2px_0px_0px_#2D2B28] transition-all text-[#2D2B28] font-black uppercase disabled:opacity-50"
                                >
                                    <Sparkles size={18} strokeWidth={2.5} className={summarizing ? "animate-spin" : ""} />
                                    {summarizing ? "..." : "Summarize"}
                                </motion.button>
                            </div>

                            {summary && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-6 rounded-2xl bg-[#E6F9F5] border-2 border-[#2D2B28] shadow-[4px_4px_0px_0px_#2D2B28]"
                                >
                                    <p className="text-xs uppercase tracking-widest text-[#2D2B28] mb-3 font-black">AI Summary</p>
                                    <p className="text-sm text-[#2D2B28] leading-relaxed font-medium">{summary}</p>
                                </motion.div>
                            )}

                            <motion.button
                                whileHover={{ scale: 1.01, y: -2, boxShadow: "4px 4px 0px 0px #2D2B28" }}
                                whileTap={{ scale: 0.99, y: 0, boxShadow: "0px 0px 0px 0px #2D2B28" }}
                                onClick={createNote}
                                disabled={creating}
                                className="w-full py-4 text-sm bg-[#2D2B28] border-2 border-[#2D2B28] rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] transition-all text-[#FAF5EE] font-black uppercase tracking-widest disabled:opacity-50 hover:bg-[#4ECDC4] hover:text-[#2D2B28]"
                            >
                                {creating ? "Saving..." : "Save Note"}
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 md:gap-8">
                <div className="bg-[#FFE8DC] border-2 border-[#2D2B28] rounded-3xl p-6 shadow-[6px_6px_0px_0px_#2D2B28] flex flex-col h-[600px]">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-black text-[#2D2B28] uppercase tracking-widest">
                            All Notes
                        </h3>
                        <div className="px-3 py-1 bg-[#2D2B28] rounded-full">
                            <span className="text-xs font-bold text-[#FFE8DC]">{notes.length}</span>
                        </div>
                    </div>
                    <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
                        {notes.length === 0 ? (
                            <div className="text-center py-20 flex flex-col items-center opacity-50">
                                <FileText size={40} className="text-[#2D2B28] mb-4" strokeWidth={1.5} />
                                <p className="text-sm text-[#2D2B28] font-bold">No notes yet</p>
                            </div>
                        ) : (
                            notes.map((note) => (
                                <div
                                    key={note.noteId}
                                    className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all border-2 group ${selected?.noteId === note.noteId
                                        ? "bg-[#2D2B28] border-[#2D2B28] shadow-[4px_4px_0px_0px_#4ECDC4] translate-x-[-2px] translate-y-[-2px]"
                                        : "bg-[#FAF5EE] border-[#2D2B28] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[3px_3px_0px_0px_#2D2B28]"
                                        }`}
                                >
                                    <button onClick={() => openNote(note.noteId)} className="flex items-center gap-3 flex-1 text-left">
                                        <FileText
                                            size={18}
                                            className={`flex-shrink-0 ${selected?.noteId === note.noteId ? "text-[#4ECDC4]" : "text-[#2D2B28]"}`}
                                            strokeWidth={2.5}
                                        />
                                        <p className={`text-sm font-bold truncate w-full ${selected?.noteId === note.noteId ? "text-[#FAF5EE]" : "text-[#2D2B28]"}`}>
                                            {note.title}
                                        </p>
                                    </button>

                                    {deleteConfirm === note.noteId ? (
                                        <div className="flex items-center gap-1 bg-[#FFE8DC] p-1 rounded-lg absolute right-2 border-2 border-[#2D2B28]">
                                            <button
                                                onClick={() => deleteNote(note.noteId)}
                                                disabled={deletingId === note.noteId}
                                                className="p-1 rounded bg-[#E8503A] text-white hover:opacity-80"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirm(null)}
                                                className="p-1 rounded bg-[#FAF5EE] text-[#2D2B28] hover:bg-gray-200"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setDeleteConfirm(note.noteId)}
                                            className={`opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-[#E8503A] hover:text-white ${selected?.noteId === note.noteId ? "text-[#FAF5EE]" : "text-[#2D2B28]"}`}
                                        >
                                            <Trash2 size={16} strokeWidth={2.5} />
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="bg-[#FAF5EE] border-2 border-[#2D2B28] rounded-3xl p-6 md:p-8 shadow-[6px_6px_0px_0px_#2D2B28] h-[600px] flex flex-col">
                    {selected ? (
                        <div className="h-full flex flex-col">
                            <div className="border-b-2 border-[#2D2B28]/10 pb-4 mb-6">
                                <p className="text-xs text-[#2D2B28]/60 mb-1 uppercase tracking-widest font-black">Title</p>
                                <h2 className="text-2xl md:text-3xl text-[#2D2B28] font-black leading-tight">{selected.title}</h2>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar space-y-8">
                                {selected.content && (
                                    <div>
                                        <p className="text-xs text-[#2D2B28]/60 mb-3 uppercase tracking-widest font-black">Content</p>
                                        <div className="text-base text-[#2D2B28] leading-relaxed font-medium whitespace-pre-wrap bg-white p-6 rounded-2xl border-2 border-[#2D2B28]/10">
                                            {selected.content}
                                        </div>
                                    </div>
                                )}

                                {selected.summary && (
                                    <div>
                                        <p className="text-xs text-[#2D2B28]/60 mb-3 uppercase tracking-widest font-black">AI Summary</p>
                                        <div className="p-6 rounded-2xl bg-[#E6F9F5] border-2 border-[#2D2B28] shadow-[4px_4px_0px_0px_#2D2B28]">
                                            <p className="text-sm md:text-base text-[#2D2B28] leading-relaxed font-bold">{selected.summary}</p>
                                        </div>
                                    </div>
                                )}

                                {selected.attachment && (
                                    <div>
                                        <p className="text-xs text-[#2D2B28]/60 mb-3 uppercase tracking-widest font-black">Attachment</p>
                                        {renderAttachment(selected)}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                            <div className="w-24 h-24 rounded-full bg-[#2D2B28] flex items-center justify-center mb-6">
                                <FileText size={40} className="text-[#FAF5EE]" strokeWidth={1.5} />
                            </div>
                            <p className="text-lg text-[#2D2B28] font-black uppercase tracking-widest">
                                Select a note
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #2D2B28;
                    border-radius: 4px;
                    border: 2px solid #FFF9E6;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #555;
                }
            `}</style>
        </div>
    );
}