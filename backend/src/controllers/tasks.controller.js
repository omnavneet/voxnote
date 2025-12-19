import crypto from "crypto";
import {
    getAllTasks,
    createTask,
    deleteTask,
} from "../services/tasks.store.js";

export async function fetchTasks(req, res) {
    try {
        const userId = req.user?.sub;
        const tasks = await getAllTasks(userId);
        res.json(tasks);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch tasks" });
    }
}

export async function addTask(req, res) {
    try {
        const userId = req.user?.sub;
        const { text } = req.body;

        const task = {
            userId,
            taskId: crypto.randomUUID(),
            text,
            completed: false,
            createdAt: new Date().toISOString(),
        };

        const savedTask = await createTask(task);
        res.status(201).json(savedTask);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to add task" });
    }
}

export async function removeTask(req, res) {
    try {
        const userId = req.user?.sub;
        const { taskId } = req.params;

        await deleteTask(userId, taskId);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete task" });
    }
}
