import { useEffect, useState } from "react";

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
    <div className="max-w-7xl mx-auto px-6 py-4">
      <h2 className="text-xl font-medium text-white mb-3">
        Weekly Timetable
      </h2>

      <div className="overflow-x-auto rounded-lg border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg">
        <table className="w-full border-collapse text-sm text-white">
          <thead>
            <tr className="bg-white/5">
              <th className="border border-white/10 px-3 py-2.5 text-left font-medium text-white/80 text-xs">
                Time
              </th>
              {DAYS.map((day) => (
                <th
                  key={day}
                  className="border border-white/10 px-3 py-2.5 text-center font-medium text-white/80 text-xs"
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
              <tr key={hour}>
                <td className="border border-white/10 px-2 py-2 text-xs text-white/60 font-mono">
                  {hour}:00
                </td>

                {DAYS.map((day) => {
                  const slot = getSlot(day, hour);

                  return (
                    <td
                      key={day}
                      onClick={() => openEditor(day, hour)}
                      className="border border-white/10 px-3 py-3 cursor-pointer hover:bg-white/10 transition-colors duration-150"
                    >
                      <span className="text-sm">{slot?.label || ""}</span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {activeSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-[#1b2432] border border-white/10 p-6">
            <h3 className="text-white font-medium mb-4">
              Edit slot ({activeSlot.day} {activeSlot.hour}:00)
            </h3>

            <input
              autoFocus
              value={draftLabel}
              onChange={(e) => setDraftLabel(e.target.value)}
              placeholder="What are you doing?"
              className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-white outline-none focus:ring-2 focus:ring-white/20"
            />

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setActiveSlot(null)}
                className="px-4 py-2 text-sm text-white/70 hover:text-white"
              >
                Cancel
              </button>

              <button
                onClick={saveSlot}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}