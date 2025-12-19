import { getTimetable, upsertSlot } from "../services/timetable.store.js";

export async function fetchTimetable(req, res) {
    try {
        const userId = req.user?.sub;
        const slots = await getTimetable(userId);
        res.json(slots);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch timetable" });
    }
}

export async function updateSlot(req, res) {
    try {
        const userId = req.user?.sub;
        const { day, startHour, endHour, label, category } = req.body;

        const slot = {
            userId,
            slotId: `${day}-${startHour}`,
            day,
            startHour,
            endHour,
            label,
            category,
            createdAt: new Date().toISOString(),
        };

        const saved = await upsertSlot(slot);
        res.json(saved);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update slot" });
    }
}
