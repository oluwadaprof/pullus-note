import { Plus, LayoutGrid, List, Wifi, WifiOff, RefreshCw, Search, X } from 'lucide-react';
import { Button } from '@/src/primitives/ui/button';
import { useNotesStore } from '@/src/modules/utils/use-note-store';
import { cn } from '@/src/lib/utils';
import { syncPendingOperations } from '@/src/lib/sync';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useToast } from '@/src/primitives/ui/use-toast';
import { ThemeSwitcher } from '@/src/primitives/theme-switcher';

interface HeaderProps {
    onCreateNote: () => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    resultsCount?: number;
}

export function Header({ onCreateNote, searchQuery, onSearchChange, resultsCount }: HeaderProps) {
    const { viewMode, setViewMode, isOnline, pendingCount } = useNotesStore();
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [isSyncing, setIsSyncing] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    const handleManualSync = async () => {
        if (!isOnline) {
            toast({
                title: 'Offline',
                description: 'Cannot sync while offline',
                variant: 'destructive',
            });
            return;
        }

        if (pendingCount === 0) {
            toast({
                title: 'Already Synced',
                description: 'No pending changes to sync',
            });
            return;
        }

        setIsSyncing(true);
        try {
            const result = await syncPendingOperations();
            await queryClient.invalidateQueries({ queryKey: ['notes'] });

            if (result.synced > 0) {
                toast({
                    title: 'Sync Complete',
                    description: `Successfully synced ${result.synced} note${result.synced > 1 ? 's' : ''}`,
                });
            }

            if (result.failed > 0) {
                toast({
                    title: 'Sync Warning',
                    description: `Failed to sync ${result.failed} note${result.failed > 1 ? 's' : ''}. Will retry automatically.`,
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Sync Failed',
                description: 'Failed to sync. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsSyncing(false);
        }
    };

    const handleClearSearch = () => {
        onSearchChange('');
    };

    return (
        <header className="border-b bg-background sticky top-0 z-10">
            <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4">
                {/* Left Section */}
                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple-500 shadow-glow">
                        <svg className="h-5 w-5 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 3v18M3 12h18" />
                        </svg>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold hidden sm:block">Notes</h1>
                    <div className="hidden lg:flex items-center gap-2">
                        {isOnline ? (
                            <div className="flex items-center rounded-full bg-green-600/10 px-2.5 py-1 gap-1.5 text-xs text-green-600">
                                <Wifi className="h-4 w-4" />
                                <span>Online</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 text-xs bg-yellow-600/10 px-2.5 py-1 rounded-full text-yellow-600">
                                <WifiOff className="h-4 w-4" />
                                <span>Offline</span>
                            </div>
                        )}
                        {pendingCount > 0 && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900 rounded-full text-xs text-yellow-800 dark:text-yellow-200">
                                <span>{pendingCount} pending</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Center Section - Search Bar */}
                <div className="flex-1 max-w-md mx-2 sm:mx-4">
                    <div
                        className={cn(
                            'relative flex items-center rounded-2xl border bg-muted/30 transition-all duration-200',
                            isSearchFocused && 'border-primary/50 bg-background shadow-sm'
                        )}
                    >
                        <Search className={cn(
                            'absolute left-3 h-4 w-4 transition-colors',
                            isSearchFocused ? 'text-primary' : 'text-muted-foreground'
                        )} />
                        <input
                            type="text"
                            placeholder="Search notes..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setIsSearchFocused(false)}
                            className="w-full bg-transparent py-2 sm:py-2.5 pl-10 pr-16 sm:pr-20 text-sm outline-none placeholder:text-muted-foreground"
                        />
                        <div className="absolute right-1.5 flex items-center gap-1">
                            {searchQuery && resultsCount !== undefined && (
                                <div className="hidden sm:block rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                                    {resultsCount}
                                </div>
                            )}
                            {searchQuery && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleClearSearch}
                                    className="h-7 w-7 rounded-lg hover:bg-muted"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    {pendingCount > 0 && isOnline && (
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleManualSync}
                            disabled={isSyncing}
                            title="Sync now"
                            className="rounded-xl h-9 w-9"
                        >
                            <RefreshCw className={cn('h-4 w-4', isSyncing && 'animate-spin')} />
                        </Button>
                    )}

                    <div className="hidden sm:flex border rounded-xl p-1 gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                                'h-8 w-8 rounded-lg',
                                viewMode === 'grid' ? 'bg-accent' : 'text-muted-foreground hover:text-foreground'
                            )}
                            onClick={() => setViewMode('grid')}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                                'h-8 w-8 rounded-lg',
                                viewMode === 'list' ? 'bg-accent' : 'text-muted-foreground hover:text-foreground'
                            )}
                            onClick={() => setViewMode('list')}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="hidden sm:block">
                        <ThemeSwitcher />
                    </div>

                    <Button className='rounded-xl h-9' onClick={onCreateNote}>
                        <Plus className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">New Note</span>
                    </Button>
                </div>
            </div>

            {/* Mobile Status Bar */}
            <div className="flex lg:hidden items-center gap-2 px-4 pb-3">
                {isOnline ? (
                    <div className="flex items-center rounded-full bg-green-600/10 px-2.5 py-1 gap-1.5 text-xs text-green-600">
                        <Wifi className="h-3.5 w-3.5" />
                        <span>Online</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5 text-xs bg-yellow-600/10 px-2.5 py-1 rounded-full text-yellow-600">
                        <WifiOff className="h-3.5 w-3.5" />
                        <span>Offline</span>
                    </div>
                )}
                {pendingCount > 0 && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900 rounded-full text-xs text-yellow-800 dark:text-yellow-200">
                        <span>{pendingCount} pending</span>
                    </div>
                )}
                {searchQuery && resultsCount !== undefined && (
                    <div className="ml-auto rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                        {resultsCount} {resultsCount === 1 ? 'result' : 'results'}
                    </div>
                )}
            </div>
        </header>
    );
}