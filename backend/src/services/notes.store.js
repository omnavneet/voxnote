const notes = new Map();

export function getAllNotes(userId) {
  return notes.get(userId) || [];
}

export function createNote(note) {
  const userNotes = notes.get(note.userId) || [];
  userNotes.push(note);
  notes.set(note.userId, userNotes);
  return note;
}
