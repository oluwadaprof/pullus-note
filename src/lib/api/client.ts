import { Note, NoteCreate, NoteUpdate } from '@/src/modules/utils/type';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const USER_ID = process.env.NEXT_PUBLIC_USER_ID!;

const getHeaders = (includePrefer = false) => {
  const headers: Record<string, string> = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  };

  if (includePrefer) {
    headers['Prefer'] = 'return=representation';
  }

  return headers;
};

export async function fetchAllNotes(): Promise<Note[]> {
  const encodedUserId = encodeURIComponent(USER_ID);
  const url = `${SUPABASE_URL}/notes?user_id=eq.${encodedUserId}&order=created_at.desc`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch notes: ${response.statusText}`);
  }

  return await response.json();
}

export async function fetchNoteById(noteId: string): Promise<Note | null> {
  const encodedUserId = encodeURIComponent(USER_ID);
  const url = `${SUPABASE_URL}/notes?id=eq.${noteId}&user_id=eq.${encodedUserId}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch note: ${response.statusText}`);
  }

  const notes = await response.json();
  return notes.length > 0 ? notes[0] : null;
}

export async function createNote(data: NoteCreate): Promise<Note> {
  const url = `${SUPABASE_URL}/notes`;

  const payload = {
    user_id: data.user_id,
    title: data.title,
    content: data.content,
    created_at: new Date().toISOString(),
    modified_at: new Date().toISOString(),
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`Failed to create note: ${response.statusText} ${JSON.stringify(error)}`);
  }

  const notes = await response.json();
  return notes[0];
}

export async function updateNote(noteId: string, data: NoteUpdate): Promise<Note> {
  const encodedUserId = encodeURIComponent(USER_ID);
  const url = `${SUPABASE_URL}/notes?id=eq.${noteId}&user_id=eq.${encodedUserId}`;

  const payload = {
    title: data.title,
    content: data.content,
    modified_at: data.modified_at || new Date().toISOString(),
  };

  const response = await fetch(url, {
    method: 'PATCH',
    headers: getHeaders(true),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`Failed to update note: ${response.statusText} ${JSON.stringify(error)}`);
  }

  const notes = await response.json();
  return notes[0];
}

export async function deleteNoteApi(noteId: string): Promise<void> {
  const encodedUserId = encodeURIComponent(USER_ID);
  const url = `${SUPABASE_URL}/notes?id=eq.${noteId}&user_id=eq.${encodedUserId}`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: getHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`Failed to delete note: ${response.statusText} ${JSON.stringify(error)}`);
  }
}