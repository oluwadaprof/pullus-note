import { 
    getSyncQueue, 
    removeSyncQueueItem, 
    updateSyncQueueItem, 
    saveNote,
    clearSyncQueueForNote,
    deleteNote 
} from '@/src/lib/db';
import { createNote, updateNote, deleteNoteApi } from '@/src/lib/api/client';
import { useNotesStore } from '@/src/modules/utils/use-note-store';

const MAX_RETRIES = 3;

export function setupSyncListener() {
    if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
        navigator.serviceWorker.ready.then((registration) => {
            navigator.serviceWorker.addEventListener('message', (event: MessageEvent) => {
                if (event.data && event.data.type === 'SYNC_COMPLETE') {
                    const state = useNotesStore.getState();
                    state.setPendingCount(0);
                }
            });
        });
    }
}

export function registerBackgroundSync() {
    if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
        navigator.serviceWorker.ready
            .then((registration: any) => {
                return registration.sync.register('sync-notes');
            })
            .catch((error) => {
                syncPendingOperations();
            });
    } else {
        syncPendingOperations();
    }
}

export async function syncPendingOperations(): Promise<{ success: boolean; synced: number; failed: number }> {
    if (!navigator.onLine) {
        return { success: false, synced: 0, failed: 0 };
    }

    const queue = await getSyncQueue();
    
    if (queue.length === 0) {
        useNotesStore.getState().setPendingCount(0);
        return { success: true, synced: 0, failed: 0 };
    }

    const sortedQueue = queue.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    let syncedCount = 0;
    let failedCount = 0;

    for (const item of sortedQueue) {
        try {
            await processSyncItem(item);
            await removeSyncQueueItem(item.id);
            syncedCount++;
        } catch (error) {
            failedCount++;
            
            if (item.retryCount < MAX_RETRIES) {
                await updateSyncQueueItem({
                    ...item,
                    retryCount: item.retryCount + 1,
                });
            } else {
                await removeSyncQueueItem(item.id);
                
                if (item.operation !== 'delete') {
                    const note = await import('@/src/lib/db').then(db => db.getNote(item.noteId));
                    if (note) {
                        await saveNote({ ...note, sync_status: 'failed' });
                    }
                }
            }
        }
    }

    const remainingQueue = await getSyncQueue();
    useNotesStore.getState().setPendingCount(remainingQueue.length);

    return { 
        success: failedCount === 0, 
        synced: syncedCount, 
        failed: failedCount 
    };
}

async function processSyncItem(item: any) {
    switch (item.operation) {
        case 'create': {
            const createdNote = await createNote(item.data);
            await deleteNote(item.noteId);
            await clearSyncQueueForNote(item.noteId);
            await saveNote({ ...createdNote, sync_status: 'synced' });
            break;
        }

        case 'update': {
            const { modified_at, sync_status, ...updateData } = item.data;
            const updatedNote = await updateNote(item.noteId, {
                title: updateData.title,
                content: updateData.content,
                modified_at: modified_at || new Date().toISOString(),
            });
            await clearSyncQueueForNote(item.noteId);
            await saveNote({ ...updatedNote, sync_status: 'synced' });
            break;
        }

        case 'delete': {
            await deleteNoteApi(item.noteId);
            await clearSyncQueueForNote(item.noteId);
            break;
        }

        default:
            throw new Error(`Unknown operation: ${item.operation}`);
    }
}