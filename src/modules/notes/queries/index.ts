import { useQuery } from '@tanstack/react-query';
import { getAllNotes } from '@/src/lib/db';
import { fetchAllNotes } from '@/src/lib/api/client';
import { useNotesStore } from '@/src/modules/utils/use-note-store';

const USER_ID = process.env.NEXT_PUBLIC_USER_ID!;

export function useNotes() {
  const isOnline = useNotesStore((state: any) => state.isOnline);

  return useQuery({
    queryKey: ['notes'],
    queryFn: async () => {
      const localNotes = await getAllNotes(USER_ID);

      if (isOnline) {
        try {
          const serverNotes = await fetchAllNotes();
          
          for (const serverNote of serverNotes) {
            const localNote = localNotes.find((n) => n.id === serverNote.id);
            
            if (!localNote || new Date(serverNote.modified_at) > new Date(localNote.modified_at)) {
              await import('@/src/lib/db').then((db) =>
                db.saveNote({ ...serverNote, sync_status: 'synced' })
              );
            }
          }
          
          const updatedNotes = await getAllNotes(USER_ID);
          return updatedNotes;
        } catch (error) {
          return localNotes;
        }
      }

      return localNotes;
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
}