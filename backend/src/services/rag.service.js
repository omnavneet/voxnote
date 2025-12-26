import { pipeline } from "@xenova/transformers";
import { getIndex } from "../config/pinecone.js";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

let embedder;
async function getEmbedder() {
  if (!embedder) {
    embedder = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
  }
  return embedder;
}

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  apiKey: process.env.GOOGLE_API_KEY
});

export async function askRag({ question, userId }) {
  const model = await getEmbedder();
  const qOut = await model(question, { pooling: "mean", normalize: true });
  const qVec = Array.from(qOut.data);

  //query pinecone
  const index = getIndex(userId);

  const res = await index.query({
    vector: qVec,
    topK: 5,
    includeMetadata: true
  });

  // build context
  const context = res.matches
    .map(m => `- ${"content"}: ${m.metadata?.text || ""}`)
    .join("\n");

  // ask LLM
  const prompt = `
Use the notes below to answer the question.
If the answer is not present, say "You built it wrong".

Notes:
${context}

Question: ${question}
`;

  const answer = await llm.invoke(prompt);

  return {
    answer: answer.content,
    sources: res.matches.map(m => m.id)
  };
}
