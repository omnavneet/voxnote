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
    const result = await llm.invoke(`
You are an emotional well-being assistant.

Analyze the following journal note and infer:
- The user's overall mood (positive, neutral, or negative)
- The main emotional or mental pattern you notice
- One or two gentle, practical tips to improve their state

Write a single short paragraph (no bullet points, no headings, no line breaks).
Do not mention that you are analyzing a note. Speak directly to the user in a warm, supportive tone.

Journal entry:
${state.text}
`);

    return { summary: result.content };
};

graph.addNode("summarize", summarize);
graph.addEdge(START, "summarize");
graph.addEdge("summarize", END);

export const summarizeAllNotes = graph.compile();
