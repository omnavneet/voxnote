"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, X } from "lucide-react";

export default function HomeContent({ tasks, setTasks, seconds, timerRunning, setTimerRunning, setSeconds }) {
  const [text, setText] = useState("");

  async function addTask() {
    if (!text.trim()) return;
    const res = await fetch("http://localhost:5000/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ text }),
    });
    const newTask = await res.json();
    setTasks((t) => [newTask, ...t]);
    setText("");
  }

  async function deleteTask(taskId) {
    await fetch(`http://localhost:5000/tasks/${taskId}`, {
      method: "DELETE",
      credentials: "include",
    });
    setTasks((t) => t.filter((task) => task.taskId !== taskId));
  }

  async function startFocus() {
    await fetch("http://localhost:5000/timer/start", {
      method: "POST",
      credentials: "include",
    });
  }

  async function stopFocus() {
    await fetch("http://localhost:5000/timer/stop", {
      method: "POST",
      credentials: "include",
    });
  }

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl"
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
            onClick={async () => {
              if (!timerRunning) {
                await startFocus();
                setTimerRunning(true);
              } else {
                await stopFocus();
                setTimerRunning(false);
              }
            }}
            className="flex-1 flex items-center justify-center gap-2 py-3 text-xs border border-white/20 rounded-xl hover:bg-white/5 transition-all text-slate-300 font-light"
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
              if (timerRunning) {
                await stopFocus();
              }
              setSeconds(0);
              setTimerRunning(false);
            }}
            className="px-5 py-3 text-xs border border-white/20 rounded-xl hover:bg-white/5 transition-all text-slate-300 font-light"
          >
            Reset
          </motion.button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl"
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
            className="px-5 py-2.5 text-xs border border-white/20 rounded-xl hover:bg-white/5 transition-all text-slate-300 font-light"
          >
            Add
          </motion.button>
        </div>
        <div className="space-y-3 max-h-64 overflow-y-auto">
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
                className="w-4 h-4 mt-0.5 rounded border border-slate-600 hover:border-orange-500 hover:bg-orange-500/10 transition-all flex-shrink-0"
              />
              <span className="text-xs text-slate-300 flex-1 leading-relaxed font-light">
                {task.text}
              </span>
              <button
                onClick={() => deleteTask(task.taskId)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
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
  );
}