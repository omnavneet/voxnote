import { askRag } from "../services/rag.service.js";

export async function queryRag(req, res) {
  const { question } = req.body;
  const userId = req.user?.sub;

  if (!question) {
    return res.json({ error: "Question required" });
  }

  const result = await askRag({ question, userId });
  res.json(result);
}
