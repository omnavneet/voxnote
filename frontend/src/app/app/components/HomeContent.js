"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Calendar, FileText, Headphones, Bot, User, Play, Pause, X } from "lucide-react";

// HomeContent Component
function HomeContent({ tasks, setTasks, seconds, timerRunning, setTimerRunning, setSeconds }) {
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

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Focus Timer Card */}
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
            onClick={() => setTimerRunning(!timerRunning)}
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
            onClick={() => {
              setSeconds(0);
              setTimerRunning(false);
            }}
            className="px-5 py-3 text-xs border border-white/20 rounded-xl hover:bg-white/5 transition-all text-slate-300 font-light"
          >
            Reset
          </motion.button>
        </div>
      </motion.div>

      {/* Tasks Card */}
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

// Main Dashboard Component
export default function DashboardPage() {
  const [tasks, setTasks] = useState([]);
  const [activeNav, setActiveNav] = useState("home");
  const [timerRunning, setTimerRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);

  async function fetchTasks() {
    const res = await fetch("http://localhost:5000/tasks", {
      credentials: "include",
    });
    setTasks(await res.json());
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    let interval;
    if (timerRunning) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const totalFocusedMinutes = Math.floor(seconds / 60);
  const completedTasks = 0;

  // Helper function to switch views
  const renderContent = () => {
    switch (activeNav) {
      case "home":
        return (
          <HomeContent
            tasks={tasks}
            setTasks={setTasks}
            seconds={seconds}
            timerRunning={timerRunning}
            setTimerRunning={setTimerRunning}
            setSeconds={setSeconds}
          />
        );
      case "timetable":
        return (
          <div className="text-white text-xs text-center py-20">
            Timetable View Coming Soon...
          </div>
        );
      case "notes":
        return (
          <div className="text-white text-xs text-center py-20">
            Notes View Coming Soon...
          </div>
        );
      case "audio":
        return (
          <div className="text-white text-xs text-center py-20">
            Audio View Coming Soon...
          </div>
        );
      case "interview":
        return (
          <div className="text-white text-xs text-center py-20">
            Interview View Coming Soon...
          </div>
        );
      case "profile":
        return (
          <div className="text-white text-xs text-center py-20">
            Profile View Coming Soon...
          </div>
        );
      default:
        return (
          <HomeContent
            tasks={tasks}
            setTasks={setTasks}
            seconds={seconds}
            timerRunning={timerRunning}
            setTimerRunning={setTimerRunning}
            setSeconds={setSeconds}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Ambient glow effect */}
      <div className="fixed inset-0 bg-gradient-radial from-orange-500/5 via-transparent to-transparent pointer-events-none" />
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative pt-12 pb-8 px-8 flex justify-between items-start"
      >
        <div>
          <h1 className="text-sm font-light text-slate-100 tracking-tight">
            Good evening
          </h1>
          <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-[0.1em]">
            VoxNote Dashboard
          </p>
        </div>
        <div className="text-right space-y-0.5">
          <p className="text-[10px] text-slate-400 tracking-wide">
            {totalFocusedMinutes}m focused
          </p>
          <p className="text-[10px] text-slate-400 tracking-wide">
            {tasks.length} tasks · {completedTasks} done
          </p>
        </div>
      </motion.div>

      {/* Dynamic Main Content */}
      <div className="relative px-8 pb-32 max-w-6xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeNav}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 px-3 py-2.5 rounded-full border border-white/10 bg-slate-800/80 backdrop-blur-2xl shadow-2xl"
      >
        <div className="flex items-center gap-1">
          {[
            { id: "home", icon: Home, label: "Home" },
            { id: "timetable", icon: Calendar, label: "Timetable" },
            { id: "notes", icon: FileText, label: "Notes" },
            { id: "audio", icon: Headphones, label: "Audio" },
            { id: "interview", icon: Bot, label: "Interview" },
            { id: "profile", icon: User, label: "Profile" },
          ].map(({ id, icon: Icon, label }) => (
            <motion.button
              key={id}
              onClick={() => setActiveNav(id)}
              className={`relative p-3 rounded-full transition-colors ${
                activeNav === id
                  ? "text-orange-400"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              title={label}
            >
              {activeNav === id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-orange-500/10 rounded-full border border-orange-500/20"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon size={16} className="relative z-10" strokeWidth={1.5} />
            </motion.button>
          ))}
        </div>
      </motion.nav>
    </div>
  );
}