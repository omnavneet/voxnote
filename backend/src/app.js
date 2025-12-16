import express from "express";
import "dotenv/config";
import notesRoutes from "./routes/notes.routes.js";
import ragRoutes from "./routes/rag.routes.js";

const app = express();

app.use(express.json());


app.use("/notes", notesRoutes);
app.use("/rag", ragRoutes);

export default app;
