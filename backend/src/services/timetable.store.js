import { ddb } from "../config/dynamodb.js";
import { PutCommand, QueryCommand, } from "@aws-sdk/lib-dynamodb";

const TABLE = "Timetable";

export async function getTimetable(userId) {
    const res = await ddb.send(
        new QueryCommand({
            TableName: TABLE,
            KeyConditionExpression: "userId = :u",
            ExpressionAttributeValues: {
                ":u": userId,
            },
        })
    );

    return res.Items || [];
}

export async function upsertSlot(slot) {
    await ddb.send(
        new PutCommand({
            TableName: TABLE,
            Item: slot,
        })
    );

    return slot;
}
