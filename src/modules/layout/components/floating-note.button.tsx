import { NotebookPen } from 'lucide-react';
import { Button } from '@/src/primitives/ui/button';

interface FloatingNoteButtonProps {
    onCreateNote: () => void;
}

export function FloatingNoteButton({ onCreateNote }: FloatingNoteButtonProps) {
    return (
        <Button
            onClick={onCreateNote}
            className="sm:hidden fixed left-4 bottom-6 h-14 w-14 rounded-full shadow-lg z-30"
            size="icon"
        >
            <NotebookPen className="h-6 w-6" />
        </Button>
    );
}