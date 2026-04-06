import '@testing-library/jest-dom';
import { afterEach, beforeAll, afterAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from './mocks/server';

// Start MSW server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));

// Reset handlers after each test (to avoid state leaking between tests)
afterEach(() => {
  server.resetHandlers();
  cleanup();
});

// Close server after all tests
afterAll(() => server.close());

// Mock crypto.randomUUID for jsdom
Object.defineProperty(globalThis, 'crypto', {
  value: {
    randomUUID: () => Math.random().toString(36).slice(2),
  },
});

// Silence pdfmake import errors in test environment
vi.mock('pdfmake/build/pdfmake', () => ({
  default: {
    vfs: {},
    createPdf: vi.fn(() => ({
      download: vi.fn(),
      getDataUrl: vi.fn((cb: (url: string) => void) => cb('data:application/pdf;base64,mock')),
    })),
  },
}));

vi.mock('pdfmake/build/vfs_fonts', () => ({ default: {} }));
