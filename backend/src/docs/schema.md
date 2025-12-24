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
- userId
- noteId
- title
- content
- summary
- type
- createdAt
- updatedAt
- embeddingId
- metadata

- attachment (object | null)
  - key
  - filename
  - mimetype
  - size

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
