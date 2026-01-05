'use client';
import { useState, useMemo } from 'react';
import { Header } from '@/src/modules/layout/components/header';
import { NotesList } from '@/src/modules/notes/components/note-list';
import { NoteFormDialog } from '@/src/modules/notes/components/note-form-dialog';
import { DeleteDialog } from '@/src/modules/notes/components/note-delete-dialog';
import { useNotes } from '@/src/modules/notes/queries';
import { Note } from '@/src/modules/utils/type';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: notes, isLoading } = useNotes();

  // Filter notes based on search query
  const filteredNotes = useMemo(() => {
    if (!notes || !searchQuery.trim()) return notes || [];

    const query = searchQuery.toLowerCase().trim();
    return notes.filter((note) => {
      const titleMatch = note.title.toLowerCase().includes(query);
      const contentMatch = note.content.toLowerCase().includes(query);
      return titleMatch || contentMatch;
    });
  }, [notes, searchQuery]);

  const handleCreateNote = () => {
    setSelectedNote(null);
    setFormOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setSelectedNote(note);
    setFormOpen(true);
  };

  const handleDeleteNote = (id: string) => {
    setNoteToDelete(id);
    setDeleteOpen(true);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          onCreateNote={handleCreateNote}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          resultsCount={searchQuery ? filteredNotes.length : undefined}
        />
        <main className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <NotesList
              notes={filteredNotes}
              onEdit={handleEditNote}
              onDelete={handleDeleteNote}
            />
          )}
        </main>
      </div>
      <NoteFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        note={selectedNote}
      />
      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        noteId={noteToDelete}
      />
    </div>
  );
}