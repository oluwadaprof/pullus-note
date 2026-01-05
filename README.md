# Notes PWA - Offline-First Progressive Web Application

A fully functional offline-first note-taking Progressive Web App built with Next.js, TypeScript, and Supabase.

## Features

### Core Functionality
- ✅ Create, Read, Update, Delete notes
- ✅ Title (max 100 characters) and content (max 5000 characters)
- ✅ Timestamps for created and modified dates
- ✅ Responsive design (mobile and desktop)

### Offline-First Capabilities
- ✅ Works completely offline after initial load
- ✅ IndexedDB for persistent local storage
- ✅ Service Worker with caching strategies
- ✅ Background Sync API integration
- ✅ Automatic synchronization when online

### Sync Features
- ✅ Per-note sync status indicators (synced, syncing, pending, failed)
- ✅ Automatic conflict resolution (Last Write Wins strategy)
- ✅ Queue system for failed operations
- ✅ Background sync registration

### UI/UX
- ✅ Sidebar layout with shadcn/ui components
- ✅ Grid and List view toggle
- ✅ Real-time online/offline status
- ✅ Toast notifications for user feedback
- ✅ Confirmation dialog for deletions
- ✅ Character count indicators

## Tech Stack

- **Framework:** Next.js 14
- **Language:** TypeScript
- **UI Components:** shadcn/ui
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Data Fetching:** TanStack Query (React Query)
- **Database:** Supabase
- **Offline Storage:** IndexedDB (via idb)
- **Service Worker:** Custom implementation

## Folder Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx             # Main notes page
│   ├── providers.tsx        # Query & toast providers
│   └── globals.css          # Global styles
├── components/
│   ├── layout/
│   │   ├── Header.tsx       # Header with view toggle
│   │   └── Sidebar.tsx      # Sidebar navigation
│   └── ui/                  # shadcn/ui components
├── modules/
│   └── notes/
│       ├── components/      # Note-specific components
│       │   ├── NoteCard.tsx
│       │   ├── NotesList.tsx
│       │   ├── NoteFormDialog.tsx
│       │   └── DeleteDialog.tsx
│       ├── queries/         # React Query hooks
│       ├── mutations/       # Mutation hooks
│       ├── utils/           # Helper functions
│       └── types.ts         # TypeScript interfaces
└── lib/
    ├── api/                 # Supabase API client
    ├── db/                  # IndexedDB operations
    ├── sync/                # Sync logic & conflict resolution
    └── store/               # Zustand stores
```

## Conflict Resolution Strategy

This application uses the **Last Write Wins (LWW)** strategy for conflict resolution:

1. When syncing, the system compares the `modified_at` timestamps
2. The note with the most recent timestamp takes precedence
3. Local changes are preserved if they're newer than server data
4. Server data overwrites local data if it's newer

### Why Last Write Wins?

- Simple and predictable behavior
- Works well for single-user scenarios
- Minimal complexity in implementation
- Aligns with user expectations

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://scwaxiuduzyziuyjfwda.supabase.co/rest/v1
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_USER_ID=adeekotobiloba8@gmail.com
```

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Build & Deploy

```bash
npm run build
npm run start
```

### Deployment Platforms

- **Vercel:** Recommended (Zero-config deployment)
- **Netlify:** Fully supported
- **Cloudflare Pages:** Supported

## Testing Offline Mode

1. Open Chrome DevTools (F12)
2. Go to Application tab
3. Click Service Workers
4. Check "Offline" checkbox
5. Test all CRUD operations
6. Uncheck "Offline" to see sync in action

## Service Worker Caching Strategy

### Static Assets
- **Strategy:** Cache First
- **Assets:** HTML, CSS, JS, icons, manifest
- **Fallback:** Network if cache miss

### API Calls
- **Strategy:** Network First
- **Fallback:** Serve from cache if offline
- **Updates:** Cache automatically on successful requests

## Key Features Implementation

### 1. IndexedDB Structure

Two object stores:
- `notes`: Stores all note data with indexes on `user_id` and `modified_at`
- `sync_queue`: Stores pending operations for background sync

### 2. Background Sync

- Automatically registers when operations fail
- Triggered when connection is restored
- Processes queued operations in order
- Updates note status after successful sync

### 3. Sync Status Indicators

- **Synced (✓):** Green checkmark - data is synchronized
- **Syncing (↻):** Blue spinner - currently syncing
- **Pending (⏰):** Yellow clock - waiting for connection
- **Failed (!):** Red alert - sync failed, will retry

### 4. Responsive Design

- Mobile-first approach
- Sidebar hidden on mobile (< 768px)
- Grid/List toggle available on desktop
- Touch-friendly buttons and controls

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (iOS 11.3+)
- Samsung Internet: Full support

## Known Limitations

- Maximum 5000 characters per note content
- Maximum 100 characters per note title
- IndexedDB has browser storage limits (typically 50MB+)
- Service Worker requires HTTPS (except localhost)

## Performance Optimizations

- Debounced search (if implemented)
- Virtualized lists for large datasets
- Optimistic UI updates
- Efficient IndexedDB queries with indexes
- React Query caching

## Future Enhancements

- [ ] Push notifications for sync completion
- [ ] Search and filter functionality
- [ ] Tags and categories
- [ ] Rich text editor
- [ ] Export/Import notes
- [ ] Collaborative editing
- [ ] Encryption for sensitive notes

## License

MIT

## Author

Adeeko Tobiloba
adeekotobiloba8@gmail.com

## Assessment Submission

This project was built as part of the Pullus Frontend Assessment Test for demonstrating proficiency in:
- Progressive Web App development
- Offline-first architecture
- Service Workers and caching
- IndexedDB operations
- Background Sync API
- Modern React patterns
- TypeScript
- Responsive design