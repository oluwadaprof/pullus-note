import { StickyNote, Settings } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface SidebarProps {
    className?: string;
}

export function Sidebar({ className }: SidebarProps) {
    return (
        <div className={cn('pb-12 w-64 border-r bg-muted/40', className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <div className="flex items-center gap-2 px-4 mb-6">
                        <StickyNote className="h-6 w-6" />
                        <h2 className="text-lg font-semibold">Notes PWA</h2>
                    </div>
                    <div className="space-y-1">
                        <button className="flex items-center gap-3 rounded-lg px-4 py-2 w-full text-left hover:bg-accent transition-colors bg-accent">
                            <StickyNote className="h-4 w-4" />
                            <span className="text-sm font-medium">All Notes</span>
                        </button>
                        <button className="flex items-center gap-3 rounded-lg px-4 py-2 w-full text-left hover:bg-accent transition-colors">
                            <Settings className="h-4 w-4" />
                            <span className="text-sm font-medium">Settings</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}