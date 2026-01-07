"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Calendar, Clock } from "lucide-react";

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
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/timetable`, { credentials: "include" });
      const data = await res.json();
      setSlots(data);
    } catch (e) {
      console.error("Failed to fetch timetable");
    }
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
    <div className="h-[calc(100vh-200px)] md:h-[calc(100vh-180px)] flex flex-col pb-6">
      <div className="flex-1 overflow-auto rounded-3xl border-2 border-[#2D2B28] bg-[#FFF9E6] shadow-[6px_6px_0px_0px_#2D2B28] custom-scrollbar relative">
        <table className="w-full border-collapse border-spacing-0">
          <thead className="sticky top-0 z-20">
            <tr>
              <th className="bg-[#2D2B28] text-[#FAF5EE] p-3 border-r-2 border-b-2 border-[#FAF5EE]/20 text-left font-black uppercase tracking-wider sticky left-0 z-30 w-24">
                Time
              </th>
              {DAYS.map((day) => (
                <th
                  key={day}
                  className="bg-[#2D2B28] text-[#FAF5EE] p-3 border-b-2 border-l-2 border-[#FAF5EE]/20 text-center font-black uppercase tracking-wider min-w-[120px]"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i).map((hour) => (
              <tr key={hour} className="group">
                <td className="sticky left-0 z-10 bg-[#FAF5EE] border-r-2 border-b-2 border-[#2D2B28]/20 px-3 py-4 text-xs font-black text-[#2D2B28] uppercase tracking-widest text-center">
                  {hour}:00
                </td>

                {DAYS.map((day) => {
                  const slot = getSlot(day, hour);
                  return (
                    <td
                      key={day}
                      onClick={() => openEditor(day, hour)}
                      className={`border-b-2 border-r-2 border-[#2D2B28]/10 px-2 py-1 cursor-pointer transition-all relative h-16 align-top hover:bg-[#2D2B28]/5 ${slot?.label ? "bg-[#E6F9F5]" : ""
                        }`}
                    >
                      {slot?.label && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="w-full h-full bg-[#4ECDC4] border-2 border-[#2D2B28] rounded-lg p-2 shadow-[2px_2px_0px_0px_#2D2B28] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#2D2B28] transition-all"
                        >
                          <span className="text-xs text-[#2D2B28] font-bold line-clamp-2 leading-tight">
                            {slot.label}
                          </span>
                        </motion.div>
                      )}
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
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#2D2B28]/80 backdrop-blur-sm p-4"
            onClick={() => !saving && setActiveSlot(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-3xl bg-[#FFF9E6] border-2 border-[#2D2B28] p-6 md:p-8 shadow-[8px_8px_0px_0px_#2D2B28]"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-[#2D2B28] font-black text-xl md:text-2xl uppercase tracking-wide mb-2">
                    Edit Slot
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-[#2D2B28]/70 font-bold bg-[#FAF5EE] px-3 py-1 rounded-lg border-2 border-[#2D2B28]/20 inline-flex">
                    <Calendar size={16} strokeWidth={2.5} />
                    <span>{activeSlot.day} • {activeSlot.hour}:00 - {activeSlot.hour + 1}:00</span>
                  </div>
                </div>
                <button
                  onClick={() => !saving && setActiveSlot(null)}
                  className="p-2 rounded-xl border-2 border-transparent hover:border-[#2D2B28] hover:bg-[#FAF5EE] transition-all"
                >
                  <X size={20} className="text-[#2D2B28]" strokeWidth={2.5} />
                </button>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-4 rounded-xl bg-[#E8503A] border-2 border-[#2D2B28] text-white font-bold shadow-[2px_2px_0px_0px_#2D2B28]"
                >
                  {error}
                </motion.div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-[#2D2B28] mb-2">Activity</label>
                  <input
                    autoFocus
                    value={draftLabel}
                    onChange={(e) => setDraftLabel(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && !saving && saveSlot()}
                    placeholder="What needs to be done?"
                    className="w-full rounded-xl bg-[#FAF5EE] border-2 border-[#2D2B28] px-4 py-3 text-[#2D2B28] font-bold text-base placeholder:text-[#2D2B28]/30 outline-none focus:shadow-[4px_4px_0px_0px_#2D2B28] transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2, boxShadow: "2px 2px 0px 0px #2D2B28" }}
                  whileTap={{ scale: 0.98, y: 0, boxShadow: "0px 0px 0px 0px #2D2B28" }}
                  onClick={() => !saving && setActiveSlot(null)}
                  className="px-6 py-3 text-sm text-[#2D2B28] bg-[#FAF5EE] border-2 border-[#2D2B28] rounded-xl font-black uppercase tracking-wide transition-all"
                >
                  Cancel
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, y: -2, boxShadow: "4px 4px 0px 0px #2D2B28" }}
                  whileTap={{ scale: 0.98, y: 0, boxShadow: "0px 0px 0px 0px #2D2B28" }}
                  onClick={saveSlot}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FFC94D] border-2 border-[#2D2B28] text-[#2D2B28] text-sm font-black uppercase tracking-wide shadow-[2px_2px_0px_0px_#2D2B28] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check size={18} strokeWidth={3} />
                  {saving ? "..." : "Save"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #2D2B28;
          border-bottom-right-radius: 1.5rem; 
          border-bottom-left-radius: 1.5rem;
        }
        .custom-scrollbar::-webkit-scrollbar-corner {
             background: #2D2B28;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #FAF5EE;
          border: 2px solid #2D2B28;
          border-radius: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #E8503A;
        }
      `}</style>
    </div>
  );
}