import { PutCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "../db.js";

const TABLE = "FocusSessions";

export async function startSession(userId) {
    const startTime = new Date().toISOString();

    const item = {
        userId,
        startTime,
        status: "active",
    };

    await ddb.send(
        new PutCommand({
            TableName: TABLE,
            Item: item,
        })
    );

    return item;
}

export async function stopSession(userId) {
    const res = await ddb.send(
        new QueryCommand({
            TableName: TABLE,
            KeyConditionExpression: "userId = :u",
            ExpressionAttributeValues: {
                ":u": userId,
            },
            ScanIndexForward: false,
            Limit: 1,
        })
    );

    const session = res.Items?.[0];
    if (!session || session.status !== "active") {
        throw new Error("No active session");
    }

    const endTime = new Date().toISOString();
    const durationSec =
        (new Date(endTime) - new Date(session.startTime)) / 1000;

    await ddb.send(
        new UpdateCommand({
            TableName: TABLE,
            Key: {
                userId,
                startTime: session.startTime,
            },
            UpdateExpression:
                "SET endTime = :e, durationSec = :d, #s = :c",
            ExpressionAttributeNames: {
                "#s": "status",
            },
            ExpressionAttributeValues: {
                ":e": endTime,
                ":d": Math.floor(durationSec),
                ":c": "completed",
            },
        })
    );

    return { ...session, endTime, durationSec };
}
