import '@testing-library/jest-dom';
import { expect, afterEach, vi, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';

// setup environment variables for tests
beforeAll(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co/rest/v1';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key-123';
  process.env.NEXT_PUBLIC_USER_ID = 'test-user-456';
});

// cleanup after each test
afterEach(() => {
  cleanup();
});

// mock indexedDB
const indexedDB = {
  open: vi.fn(),
  deleteDatabase: vi.fn(),
  databases: vi.fn(),
};

global.indexedDB = indexedDB as any;

// mock service worker
Object.defineProperty(global.navigator, 'serviceWorker', {
  value: {
    register: vi.fn().mockResolvedValue({}),
  },
  writable: true,
});

// mock online/offline
Object.defineProperty(global.navigator, 'onLine', {
  writable: true,
  value: true,
});