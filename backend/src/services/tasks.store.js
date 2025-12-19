import { ddb } from "../config/dynamodb.js";
import { PutCommand, QueryCommand, DeleteCommand,} from "@aws-sdk/lib-dynamodb";

const TABLE = "Tasks";

export async function getAllTasks(userId) {
    const res = await ddb.send(
        new QueryCommand({
            TableName: TABLE,
            KeyConditionExpression: "userId = :u",
            ExpressionAttributeValues: {
                ":u": userId,
            },
            ScanIndexForward: false, // newest first
        })
    );

    return res.Items || [];
}

export async function createTask(task) {
    await ddb.send(
        new PutCommand({
            TableName: TABLE,
            Item: task,
        })
    );
    return task;
}

export async function deleteTask(userId, taskId) {
    await ddb.send(
        new DeleteCommand({
            TableName: TABLE,
            Key: { userId, taskId },
        })
    );
}
