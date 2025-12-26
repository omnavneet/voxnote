import { ddb } from "../config/dynamodb.js";
import { PutCommand, QueryCommand, GetCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

const TABLE = "UserImages";

export async function createImage(userId, data) {
    const now = new Date().toISOString();

    const image = {
        userId,
        imageId: data.imageId || randomUUID(),
        key: data.key,
        filename: data.filename,
        mimetype: data.mimetype,
        size: data.size,
        createdAt: now,
    };

    await ddb.send(
        new PutCommand({
            TableName: TABLE,
            Item: image,
        })
    );

    return image;
}

export async function getAllImages(userId) {
    const result = await ddb.send(
        new QueryCommand({
            TableName: TABLE,
            KeyConditionExpression: "userId = :uid",
            ExpressionAttributeValues: {
                ":uid": userId,
            },
            ScanIndexForward: false,
        })
    );

    return result.Items || [];
}

export async function getImageById(userId, imageId) {
    const result = await ddb.send(
        new GetCommand({
            TableName: TABLE,
            Key: { userId, imageId },
        })
    );

    return result.Item;
}

export async function deleteImage(userId, imageId) {
    await ddb.send(
        new DeleteCommand({
            TableName: TABLE,
            Key: { userId, imageId },
        })
    );
}
