import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Note } from '@/src/modules/utils/type';

interface SyncQueueItem {
  id: string;
  noteId: string;
  operation: 'create' | 'update' | 'delete';
  data: any;
  timestamp: string;
  retryCount: number;
}

interface NotesDB extends DBSchema {
  notes: {
    key: string;
    value: Note;
    indexes: { 'by-user': string; 'by-modified': string };
  };
  syncQueue: {
    key: string;
    value: SyncQueueItem;
    indexes: { 'by-timestamp': string; 'by-noteId': string };
  };
}

let dbInstance: IDBPDatabase<NotesDB> | null = null;

async function getDB() {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<NotesDB>('notes-db', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('notes')) {
        const notesStore = db.createObjectStore('notes', { keyPath: 'id' });
        notesStore.createIndex('by-user', 'user_id');
        notesStore.createIndex('by-modified', 'modified_at');
      }

      if (!db.objectStoreNames.contains('syncQueue')) {
        const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
        syncStore.createIndex('by-timestamp', 'timestamp');
        syncStore.createIndex('by-noteId', 'noteId');
      }
    },
  });

  return dbInstance;
}

export async function saveNote(note: Note): Promise<void> {
  const db = await getDB();
  await db.put('notes', note);
}

export async function getNote(id: string): Promise<Note | undefined> {
  const db = await getDB();
  return await db.get('notes', id);
}

export async function getAllNotes(userId: string): Promise<Note[]> {
  const db = await getDB();
  const notes = await db.getAllFromIndex('notes', 'by-user', userId);
  return notes.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function deleteNote(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('notes', id);
}

export async function addToSyncQueue(item: SyncQueueItem): Promise<void> {
  const db = await getDB();
  await db.put('syncQueue', item);
}

export async function getSyncQueue(): Promise<SyncQueueItem[]> {
  const db = await getDB();
  return await db.getAll('syncQueue');
}

export async function getSyncQueueByNoteId(noteId: string): Promise<SyncQueueItem[]> {
  const db = await getDB();
  return await db.getAllFromIndex('syncQueue', 'by-noteId', noteId);
}

export async function removeSyncQueueItem(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('syncQueue', id);
}

export async function updateSyncQueueItem(item: SyncQueueItem): Promise<void> {
  const db = await getDB();
  await db.put('syncQueue', item);
}

export async function clearSyncQueueForNote(noteId: string): Promise<void> {
  const db = await getDB();
  const items = await getSyncQueueByNoteId(noteId);
  for (const item of items) {
    await db.delete('syncQueue', item.id);
  }
}