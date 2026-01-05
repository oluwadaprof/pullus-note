'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/src/primitives/ui/toaster';
import { toast } from '@/src/primitives/ui/use-toast';
import { useEffect, useState } from 'react';
import { useNotesStore } from '@/src/modules/utils/use-note-store';
import { setupSyncListener, syncPendingOperations } from '@/src/lib/sync';
import { getSyncQueue } from '@/src/lib/db';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60,
            refetchOnWindowFocus: false,
        },
    },
});

export function Providers({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);
    const { setIsOnline, setPendingCount } = useNotesStore();

    useEffect(() => {
        setMounted(true);

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/sw.js')
                .then(() => { })
                .catch(() => { });
        }

        setupSyncListener();

        const updatePendingCount = async () => {
            try {
                const queue = await getSyncQueue();
                setPendingCount(queue.length);
            } catch (error) { }
        };

        const handleOnline = async () => {
            setIsOnline(true);

            try {
                const result = await syncPendingOperations();
                queryClient.invalidateQueries({ queryKey: ['notes'] });
                await updatePendingCount();

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
            } catch (error) { }
        };

        const handleOffline = () => {
            setIsOnline(false);
        };

        setIsOnline(navigator.onLine);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        updatePendingCount();
        const interval = setInterval(updatePendingCount, 5000);

        if (navigator.onLine) {
            syncPendingOperations().then(() => {
                queryClient.invalidateQueries({ queryKey: ['notes'] });
            });
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            clearInterval(interval);
        };
    }, [setIsOnline, setPendingCount]);

    if (!mounted) return null;

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <Toaster />
        </QueryClientProvider>
    );
}