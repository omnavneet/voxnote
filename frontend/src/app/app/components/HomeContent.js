"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, X, Sparkles, Clock, CheckCircle } from "lucide-react";

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#FFE8DC] border-2 border-[#2D2B28] rounded-3xl p-6 md:p-8 shadow-[6px_6px_0px_0px_#2D2B28] hover:translate-y-[-2px] transition-transform relative overflow-hidden"
        >
          <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-[#E8503A]/10 rounded-full blur-xl pointer-events-none" />

          <div className="flex items-center gap-3 mb-8">
            <div className="bg-[#2D2B28] p-2 rounded-lg">
              <Clock className="text-[#FFE8DC]" size={20} strokeWidth={2.5} />
            </div>
            <h2 className="text-sm font-black text-[#2D2B28] uppercase tracking-widest">
              Focus Session
            </h2>
          </div>

          <div className="text-center mb-8 relative">
            <div className="text-7xl md:text-8xl font-black text-[#2D2B28] tracking-tighter tabular-nums drop-shadow-sm">
              {formatTime(seconds)}
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full border-4 border-[#2D2B28]/5 rounded-full blur-lg -z-10 transform scale-125" />
          </div>

          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.02, y: -2, boxShadow: "4px 4px 0px 0px #2D2B28" }}
              whileTap={{ scale: 0.98, y: 0, boxShadow: "0px 0px 0px 0px #2D2B28" }}
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
              className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 text-base border-2 border-[#2D2B28] rounded-xl shadow-[2px_2px_0px_0px_#2D2B28] transition-all font-black uppercase tracking-wide ${timerRunning
                  ? "bg-[#FFC94D] text-[#2D2B28]"
                  : "bg-[#E8503A] text-[#2D2B28]"
                }`}
            >
              {timerRunning ? (
                <>
                  <Pause size={20} strokeWidth={3} />
                  Pause
                </>
              ) : (
                <>
                  <Play size={20} strokeWidth={3} />
                  Start
                </>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, y: -2, boxShadow: "4px 4px 0px 0px #2D2B28" }}
              whileTap={{ scale: 0.98, y: 0, boxShadow: "0px 0px 0px 0px #2D2B28" }}
              onClick={async () => {
                if (timerRunning) await stopFocus();
                setSeconds(0);
                setTimerRunning(false);
              }}
              className="px-6 py-4 text-base bg-[#FAF5EE] border-2 border-[#2D2B28] rounded-xl shadow-[2px_2px_0px_0px_#2D2B28] transition-all text-[#2D2B28] font-bold"
            >
              Reset
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#FFF9E6] border-2 border-[#2D2B28] rounded-3xl p-6 md:p-8 shadow-[6px_6px_0px_0px_#2D2B28] flex flex-col h-full hover:translate-y-[-2px] transition-transform"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-[#2D2B28] p-2 rounded-lg">
                <CheckCircle className="text-[#FFF9E6]" size={20} strokeWidth={2.5} />
              </div>
              <h2 className="text-sm font-black text-[#2D2B28] uppercase tracking-widest">
                Today's Tasks
              </h2>
            </div>
            <div className="px-3 py-1 bg-[#2D2B28] text-[#FFF9E6] text-xs font-bold rounded-full">
              {tasks.length} REMAINING
            </div>
          </div>

          <div className="flex gap-3 mb-6">
            <input
              className="flex-1 text-sm px-4 py-3 bg-[#FAF5EE] border-2 border-[#2D2B28] rounded-xl focus:outline-none focus:shadow-[2px_2px_0px_0px_#2D2B28] placeholder:text-[#2D2B28]/40 text-[#2D2B28] font-bold transition-all"
              placeholder="What needs to be done?"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
            />
            <motion.button
              whileHover={{ scale: 1.05, y: -2, boxShadow: "2px 2px 0px 0px #2D2B28" }}
              whileTap={{ scale: 0.95, y: 0, boxShadow: "0px 0px 0px 0px #2D2B28" }}
              onClick={addTask}
              disabled={addingTask}
              className="px-5 py-3 text-sm bg-[#4ECDC4] border-2 border-[#2D2B28] rounded-xl shadow-[2px_2px_0px_0px_#2D2B28] transition-all text-[#FAF5EE] font-black uppercase disabled:opacity-50"
            >
              {addingTask ? "..." : "Add"}
            </motion.button>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-[200px] max-h-[300px]">
            {tasks.map((task, idx) => (
              <motion.div
                key={task.taskId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-start gap-3 p-3 rounded-xl bg-[#FAF5EE] border-2 border-[#2D2B28] hover:shadow-[2px_2px_0px_0px_#2D2B28] transition-all group"
              >
                <button
                  onClick={() => deleteTask(task.taskId)}
                  disabled={deletingId === task.taskId}
                  className="w-6 h-6 mt-0.5 rounded-lg border-2 border-[#2D2B28] hover:bg-[#4ECDC4] transition-all flex-shrink-0 disabled:opacity-50 flex items-center justify-center group-hover/btn"
                >
                  <div className="w-0 h-0 group-hover:w-3 group-hover:h-3 bg-[#2D2B28] rounded-sm transition-all" />
                </button>
                <span className="text-sm text-[#2D2B28] flex-1 leading-relaxed font-bold pt-1">
                  {task.text}
                </span>
                <button
                  onClick={() => deleteTask(task.taskId)}
                  disabled={deletingId === task.taskId}
                  className="opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 p-1 hover:bg-[#E8503A] hover:text-white rounded-md border-2 border-transparent hover:border-[#2D2B28]"
                >
                  <X size={16} strokeWidth={3} />
                </button>
              </motion.div>
            ))}
            {tasks.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-[#2D2B28]/20 rounded-xl">
                <p className="text-sm text-[#2D2B28]/50 font-bold uppercase tracking-wide">
                  No tasks yet
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
        className="bg-[#E6F9F5] border-2 border-[#2D2B28] rounded-3xl p-6 md:p-8 shadow-[6px_6px_0px_0px_#2D2B28]"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-[#2D2B28] p-2 rounded-lg">
              <Sparkles className="text-[#E6F9F5]" size={20} strokeWidth={2.5} />
            </div>
            <h2 className="text-sm font-black text-[#2D2B28] uppercase tracking-widest">
              AI Notes Summary
            </h2>
          </div>
          <motion.button
            whileHover={{ scale: 1.02, y: -2, boxShadow: "4px 4px 0px 0px #2D2B28" }}
            whileTap={{ scale: 0.98, y: 0, boxShadow: "0px 0px 0px 0px #2D2B28" }}
            onClick={handleSummarizeClick}
            disabled={loadingSummary}
            className="flex items-center justify-center gap-2 px-6 py-3 text-sm bg-[#6A0572] border-2 border-[#2D2B28] rounded-xl shadow-[2px_2px_0px_0px_#2D2B28] transition-all text-[#FAF5EE] font-black uppercase disabled:opacity-50 w-full sm:w-auto"
          >
            <Sparkles size={18} strokeWidth={2.5} className={loadingSummary ? "animate-spin" : ""} />
            {loadingSummary ? "Thinking..." : "Generate"}
          </motion.button>
        </div>

        {notesSummary ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-[#FAF5EE] border-2 border-[#2D2B28] rounded-2xl text-[#2D2B28] text-sm md:text-base font-medium leading-relaxed shadow-[4px_4px_0px_0px_rgba(45,43,40,0.1)]"
          >
            {notesSummary}
          </motion.div>
        ) : (
          !loadingSummary && (
            <div className="text-center py-10 border-2 border-dashed border-[#2D2B28]/20 rounded-2xl bg-[#FAF5EE]/50">
              <p className="text-sm text-[#2D2B28]/60 font-bold max-w-md mx-auto">
                Click Generate to analyze your notes
              </p>
            </div>
          )
        )}
      </motion.div>

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