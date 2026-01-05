export interface Note {
    id: string;
    user_id: string;
    title: string;
    content: string;
    created_at: string;
    modified_at: string;
    sync_status?: 'synced' | 'syncing' | 'pending' | 'failed';
    local_modified_at?: string;
  }
  
  export interface NoteCreate {
    user_id: string;
    title: string;
    content: string;
  }
  
  export interface NoteUpdate {
    title: string;
    content: string;
    modified_at: string;
  }
  
  export type ViewMode = 'grid' | 'list';
  
  export interface SyncOperation {
    id: string;
    noteId: string;
    operation: 'create' | 'update' | 'delete';
    data: any;
    timestamp: string;
    retryCount: number;
  }