"use client";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [tasks, setTasks] = useState([]);
  const [text, setText] = useState("");

  async function fetchTasks() {
    const res = await fetch("http://localhost:5000/tasks", {
      credentials: "include",
    });
    setTasks(await res.json());
  }

  async function addTask() {
    if (!text.trim()) return;

    const res = await fetch("http://localhost:5000/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ text }),
    });

    const newTask = await res.json();
    setTasks((t) => [newTask, ...t]);
    setText("");
  }

  async function deleteTask(taskId) {
    await fetch(`http://localhost:5000/tasks/${taskId}`, {
      method: "DELETE",
      credentials: "include",
    });

    setTasks((t) => t.filter((task) => task.taskId !== taskId));
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="p-6">
      <h2 className="font-semibold text-lg mb-2">Tasks</h2>

      <div className="flex gap-2 mb-4">
        <input
          className="border px-2 py-1 flex-1"
          placeholder="New task..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button onClick={addTask} className="px-3 border">
          Add
        </button>
      </div>

      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.taskId}
            className="flex justify-between items-center border p-2"
          >
            <span>{task.text}</span>
            <button
              onClick={() => deleteTask(task.taskId)}
              className="text-sm text-red-500"
            >
              Done
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
