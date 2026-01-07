"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Calendar, FileText, Bot, User, LogOut, Image as ImageIcon } from "lucide-react";
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
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks`, {
        method: "GET",
        credentials: "include",
      });
      if (res.ok) setTasks(await res.json());
    } catch (e) { }
  }

  async function fetchTodayFocused() {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/timer/today`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setTodayFocusedSec(data.totalSec || 0);
      }
    } catch (e) { }
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

  const navItems = [
    { id: "home", icon: Home, label: "Home", color: "bg-[#E8503A]" },
    { id: "notes", icon: FileText, label: "Notes", color: "bg-[#FFC94D]" },
    { id: "image", icon: ImageIcon, label: "Journal", color: "bg-[#4ECDC4]" },
    { id: "timetable", icon: Calendar, label: "Schedule", color: "bg-[#FF9F1C]" },
    { id: "interview", icon: Bot, label: "Coach", color: "bg-[#6A0572]" },
    { id: "profile", icon: User, label: "Account", color: "bg-[#2D2B28]" },
  ];

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
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center p-8 bg-[#FFF9E6] border-2 border-[#2D2B28] rounded-3xl shadow-[4px_4px_0px_0px_#2D2B28]">
              <div className="w-20 h-20 rounded-2xl bg-[#E6F9F5] border-2 border-[#2D2B28] flex items-center justify-center mx-auto mb-6 shadow-[2px_2px_0px_0px_#2D2B28]">
                <Bot size={32} className="text-[#2D2B28]" strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-bold text-[#2D2B28] mb-2">Interview Coach</h3>
              <p className="text-[#2D2B28]/70 font-medium">Coming Soon</p>
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
    <div className="min-h-screen bg-[#FAF5EE] text-[#2D2B28] font-sans overflow-hidden selection:bg-[#FFC94D] selection:text-[#2D2B28]">
      <div className="h-screen flex flex-col relative">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#FFC94D]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#4ECDC4]/10 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-8 pb-6 px-6 md:px-12 flex flex-row justify-between items-end max-w-6xl mx-auto w-full flex-shrink-0 z-10"
        >
          <div>
            <div className="inline-block px-4 py-2 bg-[#2D2B28] text-[#FAF5EE] text-sm md:text-base font-bold rounded-xl mb-2 tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]">
              DASHBOARD
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-[#2D2B28] tracking-tighter uppercase leading-none">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </h1>
          </div>

          <div className="flex flex-col md:flex-row gap-3 items-end md:items-center">
            <div className="flex items-center gap-2 bg-[#FFF9E6] px-4 py-2 rounded-xl border-2 border-[#2D2B28] shadow-[3px_3px_0px_0px_#2D2B28]">
              <div className="w-3 h-3 rounded-full bg-[#E8503A] border border-[#2D2B28]" />
              <p className="text-xs md:text-sm font-bold text-[#2D2B28]">
                {tasks.length} TASKS
              </p>
            </div>
            <div className="flex items-center gap-2 bg-[#E6F9F5] px-4 py-2 rounded-xl border-2 border-[#2D2B28] shadow-[3px_3px_0px_0px_#2D2B28]">
              <div className="w-3 h-3 rounded-full bg-[#4ECDC4] border border-[#2D2B28]" />
              <p className="text-xs md:text-sm font-bold text-[#2D2B28]">
                {totalFocusedMinutes}m FOCUS
              </p>
            </div>
          </div>
        </motion.div>

        <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-36 scrollbar-hide z-0">
          <div className="max-w-6xl mx-auto w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeNav}
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.99 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <motion.nav
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-2xl"
        >
          <div className="bg-[#FAF5EE] border-2 border-[#2D2B28] rounded-[2rem] p-3 flex justify-between items-center shadow-[6px_6px_0px_0px_#2D2B28]">
            {navItems.map(({ id, icon: Icon, color }) => {
              const isActive = activeNav === id;
              return (
                <motion.button
                  key={id}
                  onClick={() => setActiveNav(id)}
                  className={`relative w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-2xl transition-all border-2 ${isActive
                    ? `${color} border-[#2D2B28] text-[#FAF5EE] -translate-y-2 shadow-[4px_4px_0px_0px_#2D2B28]`
                    : "bg-transparent border-transparent text-[#2D2B28]/40 hover:bg-[#2D2B28]/5 hover:text-[#2D2B28]"
                    }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon size={22} strokeWidth={2.5} />
                </motion.button>
              );
            })}
          </div>
        </motion.nav>

        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={handleLogout}
          disabled={logoutLoading}
          className="hidden md:flex fixed top-8 right-8 w-12 h-12 rounded-xl bg-[#E8503A] border-2 border-[#2D2B28] text-[#FAF5EE] items-center justify-center shadow-[3px_3px_0px_0px_#2D2B28] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_#2D2B28] active:shadow-none active:translate-y-[3px] active:translate-x-[3px] transition-all disabled:opacity-50 disabled:cursor-not-allowed z-50"
          title="Logout"
        >
          <LogOut size={20} strokeWidth={2.5} />
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