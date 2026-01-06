import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('idb', () => {
  const mockDB = {
    put: vi.fn().mockResolvedValue(undefined),
    get: vi.fn().mockResolvedValue(undefined),
    getAllFromIndex: vi.fn().mockResolvedValue([]),
    getAll: vi.fn().mockResolvedValue([]),
    delete: vi.fn().mockResolvedValue(undefined),
  };

  return {
    openDB: vi.fn().mockResolvedValue(mockDB),
    mockDB,
  };
});

import { openDB } from 'idb';
import {
  saveNote,
  getNote,
  getAllNotes,
  deleteNote,
  addToSyncQueue,
  getSyncQueue,
  clearSyncQueueForNote,
} from '@/src/lib/db';
import { Note } from '@/src/modules/utils/type';

describe('Database Operations', () => {
  let mockDB: any;

  beforeEach(async () => {
    mockDB = await openDB('test', 1);
    vi.clearAllMocks();
  });

  describe('saveNote', () => {
    it('should save a note to IndexedDB', async () => {
      const note: Note = {
        id: '1',
        user_id: 'user1',
        title: 'Test Note',
        content: 'Test Content',
        created_at: new Date().toISOString(),
        modified_at: new Date().toISOString(),
      };

      await saveNote(note);

      expect(mockDB.put).toHaveBeenCalledWith('notes', note);
    });
  });

  describe('getNote', () => {
    it('should retrieve a note by id', async () => {
      const mockNote: Note = {
        id: '1',
        user_id: 'user1',
        title: 'Test Note',
        content: 'Test Content',
        created_at: new Date().toISOString(),
        modified_at: new Date().toISOString(),
      };

      mockDB.get.mockResolvedValueOnce(mockNote);

      const result = await getNote('1');

      expect(mockDB.get).toHaveBeenCalledWith('notes', '1');
      expect(result).toEqual(mockNote);
    });

    it('should return undefined for non-existent note', async () => {
      mockDB.get.mockResolvedValueOnce(undefined);

      const result = await getNote('non-existent');

      expect(result).toBeUndefined();
    });
  });

  describe('getAllNotes', () => {
    it('should retrieve all notes for a user sorted by creation date', async () => {
      const mockNotes: Note[] = [
        {
          id: '1',
          user_id: 'user1',
          title: 'Note 1',
          content: 'Content 1',
          created_at: '2024-01-01T00:00:00.000Z',
          modified_at: '2024-01-01T00:00:00.000Z',
        },
        {
          id: '2',
          user_id: 'user1',
          title: 'Note 2',
          content: 'Content 2',
          created_at: '2024-01-02T00:00:00.000Z',
          modified_at: '2024-01-02T00:00:00.000Z',
        },
      ];

      mockDB.getAllFromIndex.mockResolvedValueOnce(mockNotes);

      const result = await getAllNotes('user1');

      expect(mockDB.getAllFromIndex).toHaveBeenCalledWith('notes', 'by-user', 'user1');
      expect(result[0].id).toBe('2');
      expect(result[1].id).toBe('1');
    });

    it('should return empty array when no notes exist', async () => {
      mockDB.getAllFromIndex.mockResolvedValueOnce([]);

      const result = await getAllNotes('user1');

      expect(result).toEqual([]);
    });
  });

  describe('deleteNote', () => {
    it('should delete a note from IndexedDB', async () => {
      await deleteNote('1');

      expect(mockDB.delete).toHaveBeenCalledWith('notes', '1');
    });
  });

  describe('Sync Queue Operations', () => {
    it('should add item to sync queue', async () => {
      const syncItem = {
        id: 'sync1',
        noteId: 'note1',
        operation: 'create' as const,
        data: { title: 'Test' },
        timestamp: new Date().toISOString(),
        retryCount: 0,
      };

      await addToSyncQueue(syncItem);

      expect(mockDB.put).toHaveBeenCalledWith('syncQueue', syncItem);
    });

    it('should retrieve all sync queue items', async () => {
      const mockQueueItems = [
        {
          id: 'sync1',
          noteId: 'note1',
          operation: 'create',
          data: {},
          timestamp: new Date().toISOString(),
          retryCount: 0,
        },
      ];

      mockDB.getAll.mockResolvedValueOnce(mockQueueItems);

      const result = await getSyncQueue();

      expect(mockDB.getAll).toHaveBeenCalledWith('syncQueue');
      expect(result).toEqual(mockQueueItems);
    });

    it('should clear sync queue for specific note', async () => {
      const mockQueueItems = [
        {
          id: 'sync1',
          noteId: 'note1',
          operation: 'create',
          data: {},
          timestamp: new Date().toISOString(),
          retryCount: 0,
        },
        {
          id: 'sync2',
          noteId: 'note1',
          operation: 'update',
          data: {},
          timestamp: new Date().toISOString(),
          retryCount: 0,
        },
      ];

      mockDB.getAllFromIndex.mockResolvedValueOnce(mockQueueItems);

      await clearSyncQueueForNote('note1');

      expect(mockDB.delete).toHaveBeenCalledTimes(2);
      expect(mockDB.delete).toHaveBeenCalledWith('syncQueue', 'sync1');
      expect(mockDB.delete).toHaveBeenCalledWith('syncQueue', 'sync2');
    });
  });
});