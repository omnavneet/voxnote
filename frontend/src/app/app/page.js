"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Calendar, FileText, Bot, User, LogOut, Image } from "lucide-react";
import HomeContent from "./components/homeContent";
import Timetable from "./components/timetable";
import Notes from "./components/notes";

export default function DashboardPage() {
  const [tasks, setTasks] = useState([]);
  const [activeNav, setActiveNav] = useState("home");
  const [timerRunning, setTimerRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [todayFocusedSec, setTodayFocusedSec] = useState(0);

  async function fetchTasks() {
    const res = await fetch("http://localhost:5000/tasks", {
      method: "GET",
      credentials: "include",
    });
    setTasks(await res.json());
  }

  async function fetchTodayFocused() {
    const res = await fetch("http://localhost:5000/timer/today", {
      credentials: "include",
    });
    const data = await res.json();
    setTodayFocusedSec(data.totalSec || 0);
  }

  async function handleLogout() {
    await fetch("http://localhost:5000/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    window.location.href = "/sign-in";
  }

  useEffect(() => {
    fetchTasks();
    fetchTodayFocused();
  }, []);

  useEffect(() => {
    let interval;
    if (timerRunning) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else if (!timerRunning && seconds > 0) {
      // When timer stops, update the daily total
      fetchTodayFocused();
    }
    return () => clearInterval(interval);
  }, [timerRunning, seconds]);

  const totalFocusedMinutes = Math.floor(
    (todayFocusedSec + (timerRunning ? seconds : 0)) / 60
  );

  // Helper function to switch views without page refresh
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
        return <Timetable />;
      case "notes":
        return (
          <Notes />
        );
      case "interview":
        return (
          <div className="text-white text-xs text-center py-20">
            Interview View Coming Soon...
          </div>
        );
      case "image":
        return (
          <div className="text-white text-xs text-center py-20">
            Image Gallery Coming Soon...
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
            {tasks.length} tasks
          </p>
          <p className="text-[10px] text-slate-400 tracking-wide">
            {totalFocusedMinutes}m focused
          </p>
        </div>
      </motion.div>

      {/* Dynamic Main Content */}
      <div className="relative px-8 pb-32 max-w-7xl mx-auto min-h-screen">
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
            { id: "notes", icon: FileText, label: "Notes" },
            { id: "image", icon: Image, label: "Gallery" },
            { id: "timetable", icon: Calendar, label: "Timetable" },
            { id: "interview", icon: Bot, label: "Interview" },
            { id: "profile", icon: User, label: "Profile" },
          ].map(({ id, icon: Icon, label }) => (
            <motion.button
              key={id}
              onClick={() => setActiveNav(id)}
              className={`relative p-3 rounded-full transition-colors ${activeNav === id
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

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
        className="fixed bottom-8 right-20 p-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl"
      >
        <motion.button
          onClick={handleLogout}
          className="group relative p-3 rounded-full text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          title="Logout"
        >
          <LogOut size={16} strokeWidth={1.6} />
        </motion.button>
      </motion.div>
    </div>
  );
}