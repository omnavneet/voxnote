# VoxNote Schema

## User
Stored in Cognito only.
Derived at runtime from JWT.

Fields:
- userId (Cognito sub)
- email
- name

---

## Note
Core memory unit.

Fields:
- userId (string)
- noteId (string, UUID)
- title (string)
- content (string)          # full text
- summary (string | null)   # AI summary
- type (text | pdf | audio | interview | ai)
- createdAt (ISO string)
- updatedAt (ISO string)

- fileUrl (string | null)   # S3 PDF/audio
- embeddingId (string | null)
- metadata (object)

DynamoDB:
Table: Notes
PK: userId
SK: noteId

Pinecone:
Index: voxnote
Namespace: userId
Metadata: noteId, type

## Task
Dashboard-only, short-lived.

Fields:
- userId
- taskId
- text
- completed (boolean)
- createdAt

DynamoDB:
Table: Tasks
PK: userId
SK: taskId

## TimetableSlot
Weekly visual planner.

Fields:
- userId
- slotId (day-hour, e.g. Mon-14)
- day (Mon..Sun)
- hour (0–23)
- label
- category (study | class | work | break | personal)
- createdAt

DynamoDB:
Table: Timetable
PK: userId
SK: slotId

## AudioSession
Temporary before conversion to Note.

Fields:
- userId
- audioId
- s3Url
- transcript (string | null)
- createdAt

DynamoDB:
Table: AudioSessions
PK: userId
SK: audioId
