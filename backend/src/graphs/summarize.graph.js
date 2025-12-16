import { StateGraph, START, END } from "@langchain/langgraph";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0,
  apiKey: process.env.GOOGLE_API_KEY
});

/* ---------- GRAPH ---------- */
const graph = new StateGraph({
  channels: {
    text: "string",
    summary: "string"
  }
});

/* ---------- NODE ---------- */
const summarize = async (state) => {
  const result = await llm.invoke(
    `Summarize the following note in 3–4 lines:\n\n${state.text}`
  );

  return { summary: result.content };
};

graph.addNode("summarize", summarize);
graph.addEdge(START, "summarize");
graph.addEdge("summarize", END);

export const summarizeGraph = graph.compile();
