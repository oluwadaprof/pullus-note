import { Note } from '@/src/modules/utils/type';
import { NoteCard } from './note-card';
import { useNotesStore } from '@/src/modules/utils/use-note-store';
import { FileText } from 'lucide-react';

interface NotesListProps {
    notes: Note[];
    onEdit: (note: Note) => void;
    onDelete: (id: string) => void;
}

export function NotesList({ notes, onEdit, onDelete }: NotesListProps) {
    const viewMode = useNotesStore((state: any) => state.viewMode);

    if (notes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No notes yet</h3>
                <p className="text-muted-foreground">
                    Create your first note to get started
                </p>
            </div>
        );
    }

    if (viewMode === 'list') {
        return (
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
        );
    }

    return (
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
    );
}