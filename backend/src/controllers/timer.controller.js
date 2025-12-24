import { startSession, stopSession, getTodayTotal } from "../services/timer.store.js";

export async function startFocus(req, res) {
    try {
        const userId = req.user.sub;
        const session = await startSession(userId);
        res.json(session);
    } catch (e) {
        res.status(500).json({ error: "Failed to start focus" });
    }
}

export async function stopFocus(req, res) {
    try {
        const userId = req.user.sub;
        const session = await stopSession(userId);
        res.json(session);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
}

export async function today(req, res) {
    try {
        const total = await getTodayTotal(req.user.sub);
        res.json({ totalSec: total });
    } catch {
        res.status(500).json({ error: "Failed to fetch today's total" });
    }
}