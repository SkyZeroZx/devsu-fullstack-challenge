import { setupZonelessTestEnv } from 'jest-preset-angular/setup-env/zoneless';

setupZonelessTestEnv({
  errorOnUnknownElements: true,
  errorOnUnknownProperties: true,
});

// jsdom does not implement ClipboardEvent — provide a minimal polyfill so
// tests can construct `new ClipboardEvent('paste', { clipboardData })`.
if (typeof ClipboardEvent === 'undefined') {
  class ClipboardEventPolyfill extends Event implements ClipboardEvent {
    readonly clipboardData: DataTransfer | null;
    constructor(type: string, init: ClipboardEventInit = {}) {
      super(type, init);
      this.clipboardData = init.clipboardData ?? null;
    }
  }
  (globalThis as unknown as Record<string, unknown>)['ClipboardEvent'] =
    ClipboardEventPolyfill;
}
