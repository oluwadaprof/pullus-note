import { Note } from '@/src/modules/utils/type';
import { Button } from '@/src/primitives/ui/button';
import { Pencil, Trash2, Check, Clock, AlertCircle, Loader2, FileText } from 'lucide-react';
import { formatDistanceToNow } from '@/src/modules/utils/timeframe';

interface NoteCardProps {
    note: Note;
    onEdit: (note: Note) => void;
    onDelete: (id: string) => void;
    viewMode: 'grid' | 'list';
}

export function NoteCard({ note, onEdit, onDelete, viewMode }: NoteCardProps) {
    const syncStatus = {
        synced: (
            <span className="flex items-center gap-1 rounded-full bg-green-600/10 px-2 py-0.5 text-xs font-medium text-green-600">
                <Check className="h-3 w-3" />
                Synced
            </span>
        ),
        syncing: (
            <span className="flex items-center gap-1 rounded-full bg-blue-600/10 px-2 py-0.5 text-xs font-medium text-blue-600">
                <Loader2 className="h-3 w-3 animate-spin" />
                Syncing
            </span>
        ),
        pending: (
            <span className="flex items-center gap-1 rounded-full bg-yellow-600/10 px-2 py-0.5 text-xs font-medium text-yellow-600">
                <Clock className="h-3 w-3" />
                Pending
            </span>
        ),
        failed: (
            <span className="flex items-center gap-1 rounded-full bg-red-600/10 px-2 py-0.5 text-xs font-medium text-red-600">
                <AlertCircle className="h-3 w-3" />
                Failed
            </span>
        ),
    }[note.sync_status || 'synced'];

    const timeAgo = formatDistanceToNow(note.modified_at);

    if (viewMode === 'list') {
        return (
            <div className="group flex items-center gap-4 rounded-2xl p-4 transition-all hover:bg-muted/50">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{note.title}</h3>
                        {syncStatus}
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
                        {note.content || 'No content'}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground/70">
                        Created {formatDistanceToNow(note.created_at)} • Edited {timeAgo}
                    </p>
                </div>

                <div className="flex items-center gap-1 opacity-0 transition-all group-hover:opacity-100">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(note)}
                        className="h-9 w-9 rounded-xl text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(note.id)}
                        className="h-9 w-9 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="group relative flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md">
            <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                </div>
                {syncStatus}
            </div>

            <h3 className="mt-4 font-semibold text-foreground">{note.title}</h3>
            <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">
                {note.content || 'No content'}
            </p>

            <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <p className="text-xs text-muted-foreground/70">
                    Created {formatDistanceToNow(note.created_at)} • Edited {timeAgo}
                </p>
                <div className="flex items-center gap-1 opacity-0 transition-all group-hover:opacity-100">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(note)}
                        className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(note.id)}
                        className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}