/* eslint-env jest */
/* eslint-disable max-classes-per-file, no-undef */
// Jest setup file for global test configuration

// Mock global objects that are not available in jsdom
if (typeof globalThis.TransformStream === 'undefined') {
  globalThis.TransformStream = class TransformStream {
    constructor() {
      this.readable = {
        getReader: () => ({
          read: () => Promise.resolve({ done: true }),
        }),
      };
      this.writable = {
        getWriter: () => ({
          write: () => Promise.resolve(),
        }),
      };
    }
  };
}

// Mock other missing global objects if needed
if (typeof globalThis.ReadableStream === 'undefined') {
  globalThis.ReadableStream = class ReadableStream {
    constructor() {
      this.getReader = () => ({
        read: () => Promise.resolve({ done: true, value: undefined }),
      });
    }
  };
}
