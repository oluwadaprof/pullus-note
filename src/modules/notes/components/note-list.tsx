import { Note } from '@/src/modules/utils/type';
import { NoteCard } from './note-card';
import { useNotesStore } from '@/src/modules/utils/use-note-store';
import { FileText, NotebookPen, Plus } from 'lucide-react';
import { Button } from '@/src/primitives/ui/button';
import { FloatingNoteButton } from '@/src/modules/layout/components/floating-note.button';

interface NotesListProps {
    notes: Note[];
    onEdit: (note: Note) => void;
    onDelete: (id: string) => void;
    onCreateNote: () => void;
}

export function NotesList({ notes, onEdit, onDelete, onCreateNote }: NotesListProps) {
    const viewMode = useNotesStore((state: any) => state.viewMode);

    if (notes.length === 0) {
        return (
            <>
                <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                    <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No notes yet</h3>
                    <p className="text-muted-foreground">
                        Create your first note to get started
                    </p>
                    <Button
                        size='sm'
                        onClick={onCreateNote}
                        className="rounded-xl hidden md:flex gap-1 shadow-lg z-30  w-auto mt-4 text-sm px-2"
                    >
                        <Plus className="h-6 w-6" /> <span >New Note</span>
                    </Button>
                </div>
                <FloatingNoteButton onCreateNote={onCreateNote} />

            </>
        );
    }

    if (viewMode === 'list') {
        return (
            <>
                <div className="space-y-3 max-h-[calc(100vh-10rem)] overflow-y-auto max-w-7xl mx-auto">
                    {notes.map((note) => (
                        <NoteCard
                            key={note.id}
                            note={note}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            viewMode="list"
                        />
                    ))}
                </div>
                <Button
                    onClick={onCreateNote}
                    className="sm:hidden fixed left-4 bottom-6 h-14 w-14 rounded-full shadow-lg z-30"
                    size="icon"
                >
                    <NotebookPen className="h-6 w-6" />
                </Button>
            </>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[calc(100vh-10rem)] overflow-y-auto max-w-7xl mx-auto">
                {notes.map((note) => (
                    <NoteCard
                        key={note.id}
                        note={note}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        viewMode="grid"
                    />
                ))}
            </div>
            <Button
                onClick={onCreateNote}
                className="sm:hidden fixed left-4 bottom-6 h-14 w-14 rounded-full shadow-lg z-30"
                size="icon"
            >
                <NotebookPen className="h-6 w-6" />
            </Button>
        </>
    );
}