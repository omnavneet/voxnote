import express from "express";
import "dotenv/config";
import notesRoutes from "./routes/notes.routes.js";
import ragRoutes from "./routes/rag.routes.js";
import authRoutes from "./routes/auth.routes.js";
import tasksRoutes from "./routes/tasks.routes.js";
import timetableRoutes from "./routes/timetable.routes.js";
import timerRoutes from "./routes/timer.routes.js";
import imagesRoutes from "./routes/images.routes.js";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(cookieParser());

app.use("/tasks", tasksRoutes);
app.use("/auth", authRoutes);
app.use("/notes", notesRoutes);
app.use("/rag", ragRoutes);
app.use("/timetable", timetableRoutes);
app.use("/timer", timerRoutes);
app.use("/", imagesRoutes);

export default app;
