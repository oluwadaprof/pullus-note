import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/src/primitives/ui/alert-dialog';
import { useDeleteNote } from '@/src/modules/notes/mutations';
import { useToast } from '@/src/primitives/ui/use-toast';

interface DeleteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    noteId: string | null;
}

export function DeleteDialog({ open, onOpenChange, noteId }: DeleteDialogProps) {
    const deleteMutation = useDeleteNote();
    const { toast } = useToast();

    const handleDelete = async () => {
        if (!noteId) return;

        try {
            await deleteMutation.mutateAsync(noteId);
            toast({
                title: 'Success',
                description: 'Note deleted successfully',
            });
            onOpenChange(false);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete note',
                variant: 'destructive',
            });
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="rounded-xl">
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Note</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete this note? This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
                    >
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}