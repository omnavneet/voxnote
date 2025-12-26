import { pipeline } from "@xenova/transformers";
import { getIndex } from "../config/pinecone.js";

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

export async function storeEmbedding(note) {
  if (!note?.content) return;

  const model = await getEmbedder();
  const output = await model(note.content, {
    pooling: "mean",
    normalize: true
  });

  const vector = Array.from(output.data);

  const index = getIndex(note.userId);

  await index.upsert([
    {
      id: note.noteId,
      values: vector,
      metadata: {
        userId: note.userId,
        text: note.content
      }
    }
  ]);
}

export async function deleteEmbedding(noteId, userId) {
  try {
    const id = String(noteId);
    const index = getIndex(userId);

    console.log("Deleting embedding", { id, userId });

    await index.deleteOne(id);

    console.log("Delete call completed");
  } catch (err) {
    console.error("deleteEmbedding failed:", err);
  }
}
