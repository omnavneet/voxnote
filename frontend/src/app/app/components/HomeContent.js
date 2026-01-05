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
    <div className="space-y-6 max-w-6xl mx-auto">
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Focus Timer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl"
        >
          <h2 className="text-[10px] uppercase tracking-[0.15em] text-slate-400 mb-6 font-medium">
            Focus Timer
          </h2>
          <div className="text-center mb-8">
            <div className="text-6xl font-extralight tabular-nums text-slate-100 tracking-tight mb-2">
              {formatTime(seconds)}
            </div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">
              minutes elapsed
            </p>
          </div>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
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
              className="flex-1 flex items-center justify-center gap-2 px-4 md:px-5 py-2.5 text-xs border border-orange-500/30 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 transition-all text-orange-400 font-light"
            >
              {timerRunning ? (
                <>
                  <Pause size={14} strokeWidth={1.5} />
                  Pause
                </>
              ) : (
                <>
                  <Play size={14} strokeWidth={1.5} />
                  Start
                </>
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={async () => {
                if (timerRunning) await stopFocus();
                setSeconds(0);
                setTimerRunning(false);
              }}
              className="px-5 py-3 text-xs border border-white/20 rounded-xl hover:bg-white/5 transition-all text-slate-300 font-light"
            >
              Reset
            </motion.button>
          </div>
        </motion.div>

        {/* Today's Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl"
        >
          <h2 className="text-[10px] uppercase tracking-[0.15em] text-slate-400 mb-6 font-medium">
            Today's Tasks
          </h2>
          <div className="flex gap-2 mb-6">
            <input
              className="flex-1 text-xs px-4 py-2.5 border border-white/20 rounded-xl focus:outline-none focus:border-orange-500/50 bg-white/5 placeholder:text-slate-500 text-slate-200 font-light backdrop-blur-sm"
              placeholder="Add a new task..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={addTask}
              disabled={addingTask}
              className="flex items-center justify-center gap-2 px-4 md:px-5 py-2.5 text-xs border border-orange-500/30 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 transition-all text-orange-400 font-light"
            >
              {addingTask ? "Adding..." : "Add"}
            </motion.button>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {tasks.slice(0, 5).map((task, idx) => (
              <motion.div
                key={task.taskId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-start gap-3 group"
              >
                <button
                  onClick={() => deleteTask(task.taskId)}
                  disabled={deletingId === task.taskId}
                  className="w-4 h-4 mt-0.5 rounded border border-slate-600 hover:border-orange-500 hover:bg-orange-500/10 transition-all flex-shrink-0 disabled:opacity-50"
                />
                <span className="text-xs text-slate-300 flex-1 leading-relaxed font-light">
                  {task.text}
                </span>
                <button
                  onClick={() => deleteTask(task.taskId)}
                  disabled={deletingId === task.taskId}
                  className="opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                >
                  <X size={14} className="text-slate-500 hover:text-slate-300" strokeWidth={1.5} />
                </button>
              </motion.div>
            ))}
            {tasks.length === 0 && (
              <p className="text-[11px] text-slate-500 text-center py-8 font-light">
                No tasks yet. Add one to get started.
              </p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Notes Summary Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-medium">
            Notes Summary
          </h2>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSummarizeClick}
            disabled={loadingSummary}
            className="flex items-center gap-2 px-4 py-2.5 text-xs border border-purple-500/30 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 transition-all text-purple-400 font-light disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles size={14} strokeWidth={1.5} />
            {loadingSummary ? "Generating..." : "Generate Summary"}
          </motion.button>
        </div>

        {notesSummary && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-purple-500/10 backdrop-blur-xl border border-purple-500/20 rounded-xl text-slate-300 text-sm font-light leading-relaxed"
          >
            {notesSummary}
          </motion.div>
        )}

        {!notesSummary && !loadingSummary && (
          <p className="text-[11px] text-slate-500 text-center py-8 font-light">
            Click "Generate Summary" to get an AI-powered overview of all your notes.
          </p>
        )}
      </motion.div>
    </div>
  );
}
