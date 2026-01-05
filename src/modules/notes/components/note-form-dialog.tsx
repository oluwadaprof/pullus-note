import { useState, useEffect, useRef } from 'react';
import { Note } from '@/src/modules/utils/type';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/src/primitives/ui/dialog';
import { Button } from '@/src/primitives/ui/button';
import { Input } from '@/src/primitives/ui/input';
import { Textarea } from '@/src/primitives/ui/textarea';
import { Label } from '@/src/primitives/ui/label';
import { useCreateNote, useUpdateNote } from '@/src/modules/notes/mutations';
import { useToast } from '@/src/primitives/ui/use-toast';
import { useNotesStore } from '@/src/modules/utils/use-note-store';
import { FileText } from 'lucide-react';

interface NoteFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    note?: Note | null;
}

export function NoteFormDialog({ open, onOpenChange, note }: NoteFormDialogProps) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const isOnline = useNotesStore((state) => state.isOnline);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const createMutation = useCreateNote();
    const updateMutation = useUpdateNote();

    useEffect(() => {
        if (open) {
            if (note) {
                setTitle(note.title);
                setContent(note.content);
            } else {
                setTitle('');
                setContent('');
            }
            setIsSubmitting(false);
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        }
    }, [note, open]);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const forceClose = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setIsSubmitting(false);
        onOpenChange(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim() || !content.trim()) {
            toast({
                title: 'Validation Error',
                description: 'Title and content are required',
                variant: 'destructive',
            });
            return;
        }

        if (title.length > 100) {
            toast({
                title: 'Validation Error',
                description: 'Title must be 100 characters or less',
                variant: 'destructive',
            });
            return;
        }

        if (content.length > 5000) {
            toast({
                title: 'Validation Error',
                description: 'Content must be 5000 characters or less',
                variant: 'destructive',
            });
            return;
        }

        setIsSubmitting(true);

        timeoutRef.current = setTimeout(() => {
            if (isOnline) {
                toast({
                    title: 'Success',
                    description: note ? 'Note updated successfully' : 'Note created successfully',
                });
            } else {
                toast({
                    title: 'Saved Offline',
                    description: 'Your note will sync when you\'re back online',
                });
            }
            forceClose();
        }, 1500);

        const mutationPromise = note
            ? updateMutation.mutateAsync({ id: note.id, data: { title, content } })
            : createMutation.mutateAsync({ title, content });

        mutationPromise
            .then(() => {
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                    timeoutRef.current = null;
                }

                if (isOnline) {
                    toast({
                        title: 'Success',
                        description: note ? 'Note updated successfully' : 'Note created successfully',
                    });
                } else {
                    toast({
                        title: 'Saved Offline',
                        description: 'Your note will sync when you\'re back online',
                    });
                }
                forceClose();
            })
            .catch(() => {
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                    timeoutRef.current = null;
                }

                if (!isOnline) {
                    toast({
                        title: 'Saved Offline',
                        description: 'Your note will sync when you\'re back online',
                    });
                    forceClose();
                } else {
                    toast({
                        title: 'Error',
                        description: note ? 'Failed to update note' : 'Failed to create note',
                        variant: 'destructive',
                    });
                    setIsSubmitting(false);
                }
            });
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(newOpen) => {
                if (!newOpen) {
                    if (timeoutRef.current) {
                        clearTimeout(timeoutRef.current);
                        timeoutRef.current = null;
                    }
                    setIsSubmitting(false);
                }
                onOpenChange(newOpen);
            }}
        >
            <DialogContent className="sm:max-w-[600px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <DialogTitle>{note ? 'Edit Note' : 'Create Note'}</DialogTitle>
                                <DialogDescription>
                                    {note ? 'Update your note details below' : 'Fill in the details to create a new note'}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e: any) => setTitle(e.target.value)}
                                placeholder="Enter note title..."
                                maxLength={100}
                                disabled={isSubmitting}
                            />
                            <p className="text-xs text-muted-foreground">
                                {title.length}/100 characters
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="content">Content</Label>
                            <Textarea
                                id="content"
                                value={content}
                                onChange={(e: any) => setContent(e.target.value)}
                                placeholder="Enter note content..."
                                rows={10}
                                maxLength={5000}
                                disabled={isSubmitting}
                            />
                            <p className="text-xs text-muted-foreground">
                                {content.length}/5000 characters
                            </p>
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                            className="rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-xl"
                        >
                            {isSubmitting ? 'Saving...' : note ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}