import { useState } from 'react';
import { Menu, X, LayoutGrid, List, Plus } from 'lucide-react';
import { Button } from '@/src/primitives/ui/button';
import { useNotesStore } from '@/src/modules/utils/use-note-store';
import { useTheme } from 'next-themes';
import { cn } from '@/src/lib/utils';

const themeColors: Record<string, string> = {
    orange: 'bg-orange-800',
    light: 'bg-white',
    dark: 'bg-gray-800',
    red: 'bg-red-600',
    rose: 'bg-rose-600'
};

interface MobileMenuProps {
    onCreateNote: () => void;
}

export function MobileMenu({ onCreateNote }: MobileMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { viewMode, setViewMode } = useNotesStore();
    const { setTheme, themes, theme: currentTheme } = useTheme();

    const handleViewChange = (mode: 'grid' | 'list') => {
        setViewMode(mode);
        setIsOpen(false);
    };

    const handleThemeChange = (theme: string) => {
        setTheme(theme);
        setIsOpen(false);
    };

    const handleCreateNote = () => {
        onCreateNote();
        setIsOpen(false);
    };

    return (
        <>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(true)}
                className="sm:hidden rounded-xl h-9 w-9"
            >
                <Menu className="h-5 w-5" />
            </Button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black/50 z-40 sm:hidden"
                        onClick={() => setIsOpen(false)}
                    />

                    <div className="fixed top-0 right-0 h-full w-64 bg-background border-l shadow-xl z-50 sm:hidden">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="font-semibold">Menu</h2>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsOpen(false)}
                                className="rounded-xl h-9 w-9"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="p-4 space-y-6">
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-2">Layout</h3>
                                <div className="space-y-1">
                                    <button
                                        onClick={() => handleViewChange('grid')}
                                        className={cn(
                                            'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors',
                                            viewMode === 'grid' ? 'bg-accent' : 'hover:bg-accent/50'
                                        )}
                                    >
                                        <LayoutGrid className="h-4 w-4" />
                                        <span>Grid</span>
                                        {viewMode === 'grid' && (
                                            <span className="ml-auto text-green-500">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-4 w-4"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M5 13l4 4L19 7"
                                                    />
                                                </svg>
                                            </span>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleViewChange('list')}
                                        className={cn(
                                            'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors',
                                            viewMode === 'list' ? 'bg-accent' : 'hover:bg-accent/50'
                                        )}
                                    >
                                        <List className="h-4 w-4" />
                                        <span>List</span>
                                        {viewMode === 'list' && (
                                            <span className="ml-auto text-green-500">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-4 w-4"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M5 13l4 4L19 7"
                                                    />
                                                </svg>
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-2">Themes</h3>
                                <div className="space-y-1">
                                    {themes.map((theme) => (
                                        <button
                                            key={theme}
                                            onClick={() => handleThemeChange(theme)}
                                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-accent/50 transition-colors"
                                        >
                                            <div
                                                className={cn(
                                                    'flex h-4 w-4 items-center justify-center rounded-full border-2',
                                                    currentTheme === 'light' ? 'border-black bg-white' : 'border-white'
                                                )}
                                            >
                                                <div className={cn('h-2 w-2 rounded-full', themeColors[theme])} />
                                            </div>
                                            <span className="capitalize">{theme}</span>
                                            {theme === currentTheme && (
                                                <span className="ml-auto text-green-500">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-4 w-4"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M5 13l4 4L19 7"
                                                        />
                                                    </svg>
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Button
                                onClick={handleCreateNote}
                                className="w-full rounded-xl"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                New Note
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}