"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, X, Sparkles } from "lucide-react";

export default function HomeContent({ tasks, setTasks, seconds, timerRunning, setTimerRunning, setSeconds }) {
  const [text, setText] = useState("");
  const [allNotes, setAllNotes] = useState([]);
  const [notesSummary, setNotesSummary] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);

  const [addingTask, setAddingTask] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [togglingTimer, setTogglingTimer] = useState(false);
  const [error, setError] = useState("");

  async function addTask() {
    if (!text.trim() || addingTask) return;
    setAddingTask(true);
    setError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ text }),
      });
      const newTask = await res.json();
      if (!res.ok) throw new Error();
      setTasks((t) => [newTask, ...t]);
      setText("");
    } catch {
      setError("Failed to add task");
    } finally {
      setAddingTask(false);
    }
  }

  async function deleteTask(taskId) {
    if (deletingId) return;
    setDeletingId(taskId);
    setError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks/${taskId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      setTasks((t) => t.filter((task) => task.taskId !== taskId));
    } catch {
      setError("Failed to delete task");
    } finally {
      setDeletingId(null);
    }
  }

  async function startFocus() {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/timer/start`, {
      method: "POST",
      credentials: "include",
    });
  }

  async function stopFocus() {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/timer/stop`, {
      method: "POST",
      credentials: "include",
    });
  }

  async function fetchNotes() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notes`, {
      method: "GET",
      credentials: "include",
    });
    const notes = await res.json();
    return notes;
  }

  async function summarizeNotes(text) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notes/summarizeAll`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ content: text }),
    });
    const summaryData = await res.json();
    return summaryData.summary;
  }

  const handleSummarizeClick = async () => {
    if (loadingSummary) return;
    try {
      setLoadingSummary(true);
      setError("");

      const notes = allNotes.length === 0 ? await fetchNotes() : allNotes;
      if (allNotes.length === 0) setAllNotes(notes);

      if (notes.length === 0) {
        setNotesSummary("No notes found to summarize.");
        return;
      }

      const text = Array.isArray(notes)
        ? notes.map(n => `Title: ${n.title}\n${n.content}`).join("\n\n")
        : notes;

      const summary = await summarizeNotes(text);
      setNotesSummary(summary);
    } catch {
      setError("Failed to generate summary");
      setNotesSummary("Failed to generate summary. Please try again.");
    } finally {
      setLoadingSummary(false);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4 md:space-y-5">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium shadow-sm"
        >
          {error}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/90 backdrop-blur-xl border border-gray-200/60 rounded-3xl p-6 md:p-8 shadow-lg shadow-indigo-100/50 hover:shadow-xl hover:shadow-indigo-200/50 transition-all duration-500"
        >
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow-lg shadow-indigo-300" />
            <h2 className="text-sm font-semibold text-gray-600 tracking-wide">
              Focus Session
            </h2>
          </div>

          <div className="text-center mb-8">
            <div className="text-6xl md:text-7xl font-bold tabular-nums bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight mb-3">
              {formatTime(seconds)}
            </div>
            <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">
              Minutes Elapsed
            </p>
          </div>

          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              disabled={togglingTimer}
              onClick={async () => {
                if (togglingTimer) return;
                setTogglingTimer(true);
                try {
                  if (!timerRunning) {
                    await startFocus();
                    setTimerRunning(true);
                  } else {
                    await stopFocus();
                    setTimerRunning(false);
                  }
                } finally {
                  setTogglingTimer(false);
                }
              }}
              className="flex-1 flex items-center justify-center gap-2.5 px-5 py-3.5 md:py-4 text-sm bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg shadow-indigo-300/50 hover:shadow-xl hover:shadow-indigo-400/60 transition-all text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {timerRunning ? (
                <>
                  <Pause size={18} strokeWidth={2.5} />
                  Pause
                </>
              ) : (
                <>
                  <Play size={18} strokeWidth={2.5} />
                  Start Focus
                </>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={async () => {
                if (timerRunning) await stopFocus();
                setSeconds(0);
                setTimerRunning(false);
              }}
              className="px-5 md:px-6 py-3.5 md:py-4 text-sm bg-gray-100 hover:bg-gray-200 rounded-2xl transition-all text-gray-700 font-bold shadow-sm"
            >
              Reset
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/90 backdrop-blur-xl border border-gray-200/60 rounded-3xl p-6 md:p-8 shadow-lg shadow-emerald-100/50 hover:shadow-xl hover:shadow-emerald-200/50 transition-all duration-500"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-300" />
              <h2 className="text-sm font-semibold text-gray-600 tracking-wide">
                Today's Tasks
              </h2>
            </div>
          </div>

          <div className="flex gap-2.5 mb-5">
            <input
              className="flex-1 text-sm px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-gray-400 text-gray-800 font-medium transition-all"
              placeholder="Add a new task..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
            />
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={addTask}
              disabled={addingTask}
              className="px-6 py-3.5 text-sm bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl shadow-lg shadow-emerald-300/50 hover:shadow-xl hover:shadow-emerald-400/60 transition-all text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addingTask ? "..." : "Add"}
            </motion.button>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
            {tasks.slice(0, 5).map((task, idx) => (
              <motion.div
                key={task.taskId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-gray-100 hover:border-gray-200 transition-all group"
              >
                <button
                  onClick={() => deleteTask(task.taskId)}
                  disabled={deletingId === task.taskId}
                  className="w-5 h-5 mt-0.5 rounded-lg border-2 border-gray-300 hover:border-emerald-500 hover:bg-emerald-50 transition-all flex-shrink-0 disabled:opacity-50"
                />
                <span className="text-sm text-gray-800 flex-1 leading-relaxed font-medium">
                  {task.text}
                </span>
                <button
                  onClick={() => deleteTask(task.taskId)}
                  disabled={deletingId === task.taskId}
                  className="opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 p-1.5 hover:bg-gray-200 rounded-lg"
                >
                  <X size={16} className="text-gray-500 hover:text-gray-700" strokeWidth={2.5} />
                </button>
              </motion.div>
            ))}
            {tasks.length === 0 && (
              <div className="text-center py-12">
                <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-emerald-100 to-teal-100 border border-emerald-200 flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Play size={22} className="text-emerald-600" strokeWidth={2.5} />
                </div>
                <p className="text-sm text-gray-500 font-medium">
                  No tasks yet. Add one to get started!
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/90 backdrop-blur-xl border border-gray-200/60 rounded-3xl p-6 md:p-8 shadow-lg shadow-purple-100/50 hover:shadow-xl hover:shadow-purple-200/50 transition-all duration-500"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse shadow-lg shadow-purple-300" />
            <h2 className="text-sm font-semibold text-gray-600 tracking-wide">
              AI Notes Summary
            </h2>
          </div>
          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSummarizeClick}
            disabled={loadingSummary}
            className="flex items-center justify-center gap-2.5 px-5 py-3 text-sm bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-lg shadow-purple-300/50 hover:shadow-xl hover:shadow-purple-400/60 transition-all text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            <Sparkles size={16} strokeWidth={2.5} className={loadingSummary ? "animate-spin" : ""} />
            {loadingSummary ? "Generating..." : "Generate Summary"}
          </motion.button>
        </div>

        {notesSummary && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-3xl text-gray-800 text-sm md:text-base font-medium leading-relaxed shadow-inner"
          >
            {notesSummary}
          </motion.div>
        )}

        {!notesSummary && !loadingSummary && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-purple-100 to-pink-100 border border-purple-200 flex items-center justify-center mx-auto mb-5 shadow-sm">
              <Sparkles size={28} className="text-purple-600" strokeWidth={2} />
            </div>
            <p className="text-sm text-gray-500 font-medium max-w-md mx-auto">
              Click "Generate Summary" to get an AI-powered overview of all your notes.
            </p>
          </div>
        )}
      </motion.div>

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