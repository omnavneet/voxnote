"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Calendar, FileText, Bot, User, LogOut, Image } from "lucide-react";
import HomeContent from "./components/HomeContent";
import Timetable from "./components/Timetable";
import Notes from "./components/notes";
import Gallery from "./components/gallery";
import Profile from "./components/profile";

export default function DashboardPage() {
  const [tasks, setTasks] = useState([]);
  const [activeNav, setActiveNav] = useState("home");
  const [timerRunning, setTimerRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [todayFocusedSec, setTodayFocusedSec] = useState(0);
  const [logoutLoading, setLogoutLoading] = useState(false);

  async function fetchTasks() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks`, {
      method: "GET",
      credentials: "include",
    });
    setTasks(await res.json());
  }

  async function fetchTodayFocused() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/timer/today`, {
      credentials: "include",
    });
    const data = await res.json();
    setTodayFocusedSec(data.totalSec || 0);
  }

  async function handleLogout() {
    setLogoutLoading(true);
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
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
      fetchTodayFocused();
    }
    return () => clearInterval(interval);
  }, [timerRunning, seconds]);

  const totalFocusedMinutes = Math.floor(
    (todayFocusedSec + (timerRunning ? seconds : 0)) / 60
  );

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
        return <Notes />;
      case "interview":
        return (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-100 border border-blue-200 flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Bot size={28} className="text-blue-600" strokeWidth={2} />
              </div>
              <p className="text-sm text-gray-600 font-medium">Interview Coach Coming Soon</p>
            </div>
          </div>
        );
      case "image":
        return <Gallery />;
      case "profile":
        return <Profile />;
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
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 overflow-hidden">
      <div className="h-screen flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-6 md:pt-8 pb-4 md:pb-6 px-4 md:px-6 flex justify-between items-start max-w-7xl mx-auto w-full flex-shrink-0"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">
              Good evening
            </h1>
          </div>
          <div className="text-right space-y-1">
            <div className="flex items-center gap-2 justify-end">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <p className="text-sm text-gray-600 font-semibold">
                {tasks.length} tasks
              </p>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <div className="w-2 h-2 rounded-full bg-indigo-500" />
              <p className="text-sm text-gray-600 font-semibold">
                {totalFocusedMinutes}m focused
              </p>
            </div>
          </div>
        </motion.div>

        <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-28 md:pb-32 scrollbar-hide">
          <div className="max-w-7xl mx-auto">
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
        </div>

        <motion.nav
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 260, damping: 20 }}
          className="fixed bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 px-3 md:px-4 py-3 md:py-3.5 rounded-[28px] bg-white/90 backdrop-blur-xl shadow-xl shadow-gray-300/30 border border-gray-200/50 z-50"
        >
          <div className="flex items-center gap-1 md:gap-2">
            {[
              { id: "home", icon: Home, label: "Dashboard" },
              { id: "notes", icon: FileText, label: "Notes" },
              { id: "image", icon: Image, label: "Journal" },
              { id: "timetable", icon: Calendar, label: "Schedule" },
              { id: "interview", icon: Bot, label: "Coach" },
              { id: "profile", icon: User, label: "Account" },
            ].map(({ id, icon: Icon, label }) => (
              <motion.button
                key={id}
                onClick={() => setActiveNav(id)}
                className={`relative p-3 md:p-3.5 rounded-[20px] transition-all ${activeNav === id
                  ? "text-white"
                  : "text-gray-500 hover:text-gray-700"
                  }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title={label}
              >
                {activeNav === id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[20px] shadow-lg shadow-indigo-300/50"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon size={20} className="relative z-10" strokeWidth={2} />
              </motion.button>
            ))}
          </div>
        </motion.nav>

        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 260 }}
          onClick={handleLogout}
          disabled={logoutLoading}
          className="hidden md:flex fixed bottom-8 right-8 p-4 rounded-[22px] bg-white/90 backdrop-blur-xl shadow-lg shadow-red-200/30 border border-red-100 text-red-500 hover:bg-red-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed items-center justify-center z-50"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          title={logoutLoading ? "Logging out..." : "Logout"}
        >
          <LogOut size={20} strokeWidth={2} />
        </motion.button>
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}