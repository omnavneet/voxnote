User
userId (string)
name (string)
email (string)

Note
Used for text, PDF, audio, interview output.
Fields:
noteId (string)
userId (string)
title (string)
content (string)
type (text | pdf | audio | interview | ai)
createdAt (ISO string)
updatedAt (ISO string)
embeddingId (string | null)
metadata (object)

DynamoDB:
Table: Notes
Partition key: userId
Sort key: noteId

Vector DB (Pinecone):
Index: voxnote
Namespace: userId
Metadata: noteId, type

Task
Used only on Dashboard (today’s tasks).
Fields:
taskId (string)
userId (string)
text (string)
completed (boolean)
createdAt (ISO string)

DynamoDB:
Table: Tasks
Partition key: userId
Sort key: taskId

FocusSession
Used for focus timer analytics.
Fields:
sessionId (string)
userId (string)
duration (number, minutes)
startedAt (ISO string)

DynamoDB:
Table: FocusSessions
Partition key: userId
Sort key: sessionId

TimetableSlot
Weekly visual timetable (1-hour blocks).
Fields:
slotId (string)
userId (string)
day (Mon | Tue | Wed | Thu | Fri | Sat | Sun)
hour (number, 0–23)
label (string)
category (study | class | work | break | personal)
createdAt (ISO string)

DynamoDB:

Table: Timetable
Partition key: userId
Sort key: slotId

AudioSession
Voice recordings before processing.
Fields:
audioId (string)
userId (string)
s3Url (string)
transcript (string | null)
createdAt (ISO string)