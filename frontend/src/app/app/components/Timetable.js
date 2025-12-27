import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const START_HOUR = 8;
const END_HOUR = 22;

export default function Timetable() {
  const [slots, setSlots] = useState([]);
  const [activeSlot, setActiveSlot] = useState(null);
  const [draftLabel, setDraftLabel] = useState("");

  async function fetchTimetable() {
    const res = await fetch("http://localhost:5000/timetable", {
      credentials: "include",
    });
    const data = await res.json();
    setSlots(data);
  }

  useEffect(() => {
    fetchTimetable();
  }, []);

  function getSlot(day, hour) {
    return slots.find((s) => s.day === day && s.startHour === hour);
  }

  function openEditor(day, hour) {
    const slot = getSlot(day, hour);
    setActiveSlot({ day, hour });
    setDraftLabel(slot?.label || "");
  }

  async function saveSlot() {
    const { day, hour } = activeSlot;

    const payload = {
      day,
      startHour: hour,
      endHour: hour + 1,
      label: draftLabel,
      category: "study",
    };

    const res = await fetch("http://localhost:5000/timetable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const updated = await res.json();

    setSlots((prev) => {
      const filtered = prev.filter(
        (s) => !(s.day === day && s.startHour === hour)
      );
      return [...filtered, updated];
    });

    setActiveSlot(null);
    setDraftLabel("");
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-3 h-screen">
      <div className="flex items-center gap-3 mb-3">
        <h2 className="text-md font-light text-slate-200">
          Weekly Schedule
        </h2>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
        <table className="w-full border-collapse text-sm text-white">
          <thead>
            <tr className="bg-white/5">
              <th className="border border-white/10 px-4 py-2 text-left font-light text-slate-400 text-xs tracking-wider">
                Time
              </th>
              {DAYS.map((day) => (
                <th
                  key={day}
                  className="border border-white/10 px-4 py-2 text-center font-light text-slate-400 text-xs tracking-wider"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {Array.from(
              { length: END_HOUR - START_HOUR },
              (_, i) => START_HOUR + i
            ).map((hour) => (
              <tr key={hour} className="hover:bg-white/5 transition-colors">
                <td className="border border-white/10 px-4 py-3 text-xs text-slate-500 font-light">
                  {hour}:00
                </td>

                {DAYS.map((day) => {
                  const slot = getSlot(day, hour);

                  return (
                    <td
                      key={day}
                      onClick={() => openEditor(day, hour)}
                      className={`border border-white/10 px-4 py-3 cursor-pointer transition-all ${
                        slot?.label
                          ? "bg-orange-500/10 hover:bg-orange-500/20"
                          : "hover:bg-white/10"
                      }`}
                    >
                      <span className="text-sm text-slate-300 font-light">
                        {slot?.label || ""}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {activeSlot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setActiveSlot(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-slate-200 font-light text-lg mb-1">
                    Edit Time Slot
                  </h3>
                  <p className="text-xs text-slate-500 font-light">
                    {activeSlot.day} • {activeSlot.hour}:00 - {activeSlot.hour + 1}:00
                  </p>
                </div>
                <button
                  onClick={() => setActiveSlot(null)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X size={16} className="text-slate-400" strokeWidth={1.5} />
                </button>
              </div>

              <input
                autoFocus
                value={draftLabel}
                onChange={(e) => setDraftLabel(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && saveSlot()}
                placeholder="What are you doing?"
                className="w-full rounded-xl bg-white/5 border border-white/20 px-4 py-3 text-slate-200 font-light text-sm placeholder:text-slate-500 outline-none focus:border-orange-500/50 transition-all"
              />

              <div className="flex justify-end gap-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveSlot(null)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 font-light transition-colors"
                >
                  Cancel
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={saveSlot}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 text-sm font-light transition-all"
                >
                  <Check size={14} strokeWidth={1.5} />
                  Save
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}