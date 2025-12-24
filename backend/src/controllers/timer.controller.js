import { startSession, stopSession } from "../services/focus.store.js";

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
