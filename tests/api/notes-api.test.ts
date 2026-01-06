import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  fetchAllNotes,
  fetchNoteById,
  createNote,
  updateNote,
  deleteNoteApi,
} from '@/src/lib/api/client';
import { Note, NoteCreate, NoteUpdate } from '@/src/modules/utils/type';

global.fetch = vi.fn();

describe('Notes API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchAllNotes', () => {
    it('should fetch all notes successfully', async () => {
      const mockNotes: Note[] = [
        {
          id: '1',
          user_id: 'test-user',
          title: 'Test Note',
          content: 'Test Content',
          created_at: '2024-01-01T00:00:00.000Z',
          modified_at: '2024-01-01T00:00:00.000Z',
        },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockNotes,
      });

      const result = await fetchAllNotes();

      expect(result).toEqual(mockNotes);
      expect(global.fetch).toHaveBeenCalledTimes(1);
      
      const fetchCall = (global.fetch as any).mock.calls[0];
      expect(fetchCall[0]).toContain('/notes');
      expect(fetchCall[0]).toContain('user_id=eq.');
      expect(fetchCall[1].method).toBe('GET');
    });

    it('should throw error when fetch fails', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      });

      await expect(fetchAllNotes()).rejects.toThrow('Failed to fetch notes');
    });
  });

  describe('fetchNoteById', () => {
    it('should fetch a single note by id', async () => {
      const mockNote: Note = {
        id: '1',
        user_id: 'test-user',
        title: 'Test Note',
        content: 'Test Content',
        created_at: '2024-01-01T00:00:00.000Z',
        modified_at: '2024-01-01T00:00:00.000Z',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => [mockNote],
      });

      const result = await fetchNoteById('1');

      expect(result).toEqual(mockNote);
      
      const fetchCall = (global.fetch as any).mock.calls[0];
      expect(fetchCall[0]).toContain('id=eq.1');
    });

    it('should return null when note not found', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      const result = await fetchNoteById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('createNote', () => {
    it('should create a new note', async () => {
      const noteData: NoteCreate = {
        user_id: 'test-user',
        title: 'New Note',
        content: 'New Content',
      };

      const mockCreatedNote: Note = {
        id: '1',
        ...noteData,
        created_at: '2024-01-01T00:00:00.000Z',
        modified_at: '2024-01-01T00:00:00.000Z',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => [mockCreatedNote],
      });

      const result = await createNote(noteData);

      expect(result).toEqual(mockCreatedNote);
      
      const fetchCall = (global.fetch as any).mock.calls[0];
      expect(fetchCall[1].method).toBe('POST');
      expect(fetchCall[1].body).toBeTruthy();
      
      const body = JSON.parse(fetchCall[1].body);
      expect(body.title).toBe('New Note');
      expect(body.content).toBe('New Content');
    });

    it('should throw error when creation fails', async () => {
      const noteData: NoteCreate = {
        user_id: 'test-user',
        title: 'New Note',
        content: 'New Content',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
        json: async () => ({ error: 'Invalid data' }),
      });

      await expect(createNote(noteData)).rejects.toThrow('Failed to create note');
    });
  });

  describe('updateNote', () => {
    it('should update an existing note', async () => {
      const updateData: NoteUpdate = {
        title: 'Updated Title',
        content: 'Updated Content',
        modified_at: '2024-01-02T00:00:00.000Z',
      };

      const mockUpdatedNote: Note = {
        id: '1',
        user_id: 'test-user',
        title: updateData.title!,
        content: updateData.content!,
        created_at: '2024-01-01T00:00:00.000Z',
        modified_at: '2024-01-02T00:00:00.000Z',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => [mockUpdatedNote],
      });

      const result = await updateNote('1', updateData);

      expect(result).toEqual(mockUpdatedNote);
      
      const fetchCall = (global.fetch as any).mock.calls[0];
      expect(fetchCall[1].method).toBe('PATCH');
      expect(fetchCall[0]).toContain('id=eq.1');
      
      const body = JSON.parse(fetchCall[1].body);
      expect(body.title).toBe('Updated Title');
      expect(body.content).toBe('Updated Content');
    });
  });

  describe('deleteNoteApi', () => {
    it('should delete a note successfully', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
      });

      await expect(deleteNoteApi('1')).resolves.not.toThrow();

      const fetchCall = (global.fetch as any).mock.calls[0];
      expect(fetchCall[1].method).toBe('DELETE');
      expect(fetchCall[0]).toContain('id=eq.1');
    });

    it('should throw error when deletion fails', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
        json: async () => ({}),
      });

      await expect(deleteNoteApi('non-existent')).rejects.toThrow(
        'Failed to delete note'
      );
    });
  });
});