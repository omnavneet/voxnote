import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Calendar } from "lucide-react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const START_HOUR = 8;
const END_HOUR = 22;

export default function Timetable() {
  const [slots, setSlots] = useState([]);
  const [activeSlot, setActiveSlot] = useState(null);
  const [draftLabel, setDraftLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function fetchTimetable() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/timetable`, { credentials: "include" });
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
    setError("");
  }

  async function saveSlot() {
    if (!activeSlot) return;

    setSaving(true);
    setError("");

    const { day, hour } = activeSlot;
    const payload = {
      day,
      startHour: hour,
      endHour: hour + 1,
      label: draftLabel,
      category: "study",
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/timetable`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const updated = await res.json();

      if (!res.ok) {
        setError(updated.error || "Failed to save slot");
        setSaving(false);
        return;
      }

      setSlots((prev) => {
        const filtered = prev.filter((s) => !(s.day === day && s.startHour === hour));
        return [...filtered, updated];
      });

      setActiveSlot(null);
      setDraftLabel("");
    } catch (err) {
      setError("Failed to save slot");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-200px)] md:h-[calc(100vh-180px)] flex flex-col">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-2 h-2 rounded-full bg-blue-500" />
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 tracking-tight">
          Weekly Schedule
        </h2>
      </div>

      <div className="flex-1 overflow-auto rounded-3xl border border-gray-200/60 bg-white/90 backdrop-blur-xl shadow-lg">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 bg-gradient-to-br from-blue-50 to-indigo-50 backdrop-blur-xl z-10">
            <tr>
              <th className="border border-gray-200 px-3 md:px-4 py-3 text-left font-semibold text-gray-600 text-xs md:text-sm tracking-wide">
                Time
              </th>
              {DAYS.map((day) => (
                <th
                  key={day}
                  className="border border-gray-200 px-3 md:px-4 py-3 text-center font-semibold text-gray-600 text-xs md:text-sm tracking-wide"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i).map((hour) => (
              <tr key={hour} className="hover:bg-gray-50 transition-colors">
                <td className="border border-gray-200 px-3 md:px-4 py-3 md:py-4 text-xs md:text-sm text-gray-600 font-semibold bg-gray-50/50">
                  {hour}:00
                </td>

                {DAYS.map((day) => {
                  const slot = getSlot(day, hour);
                  return (
                    <td
                      key={day}
                      onClick={() => openEditor(day, hour)}
                      className={`border border-gray-200 px-3 md:px-4 py-3 md:py-4 cursor-pointer transition-all ${slot?.label
                        ? "bg-gradient-to-br from-orange-50 to-red-50 hover:from-blue-100 hover:to-indigo-100"
                        : "hover:bg-gray-50"
                        }`}
                    >
                      <span className="text-xs md:text-sm text-gray-800 font-medium">
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => !saving && setActiveSlot(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-3xl bg-white/95 backdrop-blur-xl border border-gray-200 p-6 md:p-8 shadow-2xl"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-gray-800 font-bold text-lg md:text-xl mb-2">
                    Edit Time Slot
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                    <Calendar size={16} strokeWidth={2} />
                    <span>{activeSlot.day} • {activeSlot.hour}:00 - {activeSlot.hour + 1}:00</span>
                  </div>
                </div>
                <button
                  onClick={() => !saving && setActiveSlot(null)}
                  className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <X size={20} className="text-gray-500" strokeWidth={2} />
                </button>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium"
                >
                  {error}
                </motion.div>
              )}

              <input
                autoFocus
                value={draftLabel}
                onChange={(e) => setDraftLabel(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && !saving && saveSlot()}
                placeholder="What are you doing?"
                className="w-full rounded-2xl bg-gray-50 border border-gray-200 px-4 py-3.5 text-gray-800 font-medium text-sm placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />

              <div className="flex justify-end gap-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => !saving && setActiveSlot(null)}
                  className="px-5 py-3 text-sm text-gray-600 hover:bg-gray-100 rounded-2xl font-semibold transition-colors"
                >
                  Cancel
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={saveSlot}
                  disabled={saving}
                  className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm font-bold shadow-lg shadow-indigo-300/50 hover:shadow-xl hover:shadow-indigo-400/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check size={16} strokeWidth={2.5} />
                  {saving ? "Saving..." : "Save"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .overflow-auto::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .overflow-auto::-webkit-scrollbar-track {
          background: rgba(243, 244, 246, 0.5);
          border-radius: 10px;
        }
        .overflow-auto::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.5);
          border-radius: 10px;
        }
        .overflow-auto::-webkit-scrollbar-thumb:hover {
          background: rgba(107, 114, 128, 0.7);
        }
      `}</style>
    </div>
  );
}