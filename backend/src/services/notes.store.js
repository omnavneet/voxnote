import { ddb } from "../config/dynamodb.js";
import {PutCommand, QueryCommand, GetCommand,} from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

const notes = new Map();
const TABLE = "Notes";

export async function createNote(userId, data) {
  const now = new Date().toISOString();

  const note = {
    userId,
    noteId: randomUUID(),
    title: data.title,
    content: data.content,
    summary: data.summary || null,
    type: data.type,
    fileUrl: data.fileUrl || null,
    embeddingId: null,
    metadata: data.metadata || {},
    createdAt: now,
    updatedAt: now,
  };

  await ddb.send(
    new PutCommand({
      TableName: TABLE,
      Item: note,
    })
  );

  return note;
}

export async function getAllNotes(userId) {
  const result = await ddb.send(
    new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: "userId = :uid",
      ExpressionAttributeValues: {
        ":uid": userId,
      },
    })
  );

  return result.Items || [];
}

export async function getNoteById(userId, noteId) {
  const result = await ddb.send(
    new GetCommand({
      TableName: TABLE,
      Key: { userId, noteId },
    })
  );

  return result.Item;
}
