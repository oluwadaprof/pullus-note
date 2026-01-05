import { useMutation, useQueryClient } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import { Note, NoteCreate, NoteUpdate } from '@/src/modules/utils/type';
import { saveNote, deleteNote, addToSyncQueue, clearSyncQueueForNote, getNote } from '@/src/lib/db';
import { createNote, updateNote, deleteNoteApi } from '@/src/lib/api/client';
import { useNotesStore } from '@/src/modules/utils/use-note-store';
import { registerBackgroundSync } from '@/src/lib/sync';

const USER_ID = process.env.NEXT_PUBLIC_USER_ID!;

export function useCreateNote() {
    const queryClient = useQueryClient();
    const isOnline = useNotesStore((state) => state.isOnline);
  
    return useMutation({
      mutationFn: async (data: Omit<NoteCreate, 'user_id'>) => {
        const now = new Date().toISOString();
        const tempId = uuidv4();
        const localNote: Note = {
          id: tempId,
          user_id: USER_ID,
          title: data.title,
          content: data.content,
          created_at: now,
          modified_at: now,
          sync_status: isOnline ? 'syncing' : 'pending',
        };
  
        await saveNote(localNote);
  
        if (isOnline) {
          try {
            const serverNote = await createNote({ ...data, user_id: USER_ID });
            await deleteNote(tempId);
            await saveNote({ ...serverNote, sync_status: 'synced' });
            await clearSyncQueueForNote(tempId);
            return serverNote;
          } catch (error) {
            await addToSyncQueue({
              id: uuidv4(),
              noteId: tempId,
              operation: 'create',
              data: { ...data, user_id: USER_ID },
              timestamp: now,
              retryCount: 0,
            });
            await saveNote({ ...localNote, sync_status: 'failed' });
            registerBackgroundSync();
            return localNote;
          }
        } else {
          await addToSyncQueue({
            id: uuidv4(),
            noteId: tempId,
            operation: 'create',
            data: { ...data, user_id: USER_ID },
            timestamp: now,
            retryCount: 0,
          });
          registerBackgroundSync();
          return localNote;
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['notes'] });
      },
    });
}

export function useUpdateNote() {
    const queryClient = useQueryClient();
    const isOnline = useNotesStore((state) => state.isOnline);
  
    return useMutation({
      mutationFn: async ({ id, data }: { id: string; data: Omit<NoteUpdate, 'modified_at'> }) => {
        const now = new Date().toISOString();
        const updates: NoteUpdate = { ...data, modified_at: now };
  
        const localNoteData = await getNote(id);
        if (!localNoteData) throw new Error('Note not found');
  
        const updatedLocal = {
          ...localNoteData,
          ...updates,
          sync_status: isOnline ? 'syncing' as const : 'pending' as const,
        };
  
        await saveNote(updatedLocal);
  
        if (isOnline) {
          try {
            const serverNote = await updateNote(id, updates);
            await saveNote({ ...serverNote, sync_status: 'synced' });
            await clearSyncQueueForNote(id);
            return serverNote;
          } catch (error) {
            await addToSyncQueue({
              id: uuidv4(),
              noteId: id,
              operation: 'update',
              data: updatedLocal,
              timestamp: now,
              retryCount: 0,
            });
            await saveNote({ ...updatedLocal, sync_status: 'failed' });
            registerBackgroundSync();
            return updatedLocal;
          }
        } else {
          await addToSyncQueue({
            id: uuidv4(),
            noteId: id,
            operation: 'update',
            data: updatedLocal,
            timestamp: now,
            retryCount: 0,
          });
          registerBackgroundSync();
          return updatedLocal;
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['notes'] });
      },
    });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();
  const isOnline = useNotesStore((state) => state.isOnline);

  return useMutation({
    mutationFn: async (id: string) => {
      await deleteNote(id);

      if (isOnline) {
        try {
          await deleteNoteApi(id);
          await clearSyncQueueForNote(id);
        } catch (error) {
          await addToSyncQueue({
            id: uuidv4(),
            noteId: id,
            operation: 'delete',
            data: null,
            timestamp: new Date().toISOString(),
            retryCount: 0,
          });
          registerBackgroundSync();
        }
      } else {
        await addToSyncQueue({
          id: uuidv4(),
          noteId: id,
          operation: 'delete',
          data: null,
          timestamp: new Date().toISOString(),
          retryCount: 0,
        });
        registerBackgroundSync();
      }
      
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}