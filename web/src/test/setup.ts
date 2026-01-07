import "@testing-library/jest-dom/vitest";

// Minimal IntersectionObserver mock for jsdom.
class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// @ts-expect-error - attach mock to global in test env
globalThis.IntersectionObserver = MockIntersectionObserver;


