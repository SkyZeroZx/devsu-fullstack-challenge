import {
  EnvironmentProviders,
  Injectable,
  isDevMode,
  makeEnvironmentProviders,
} from '@angular/core';

// ── Abstract adapter (DI token & contract) ───────────────────────────────────
// Pattern mirrors Angular's HttpBackend / HttpClient:
//   abstract class = public DI token consumers inject
//   concrete class = registered via useExisting in provideAnalytics()
export abstract class AnalyticsAdapter {
  abstract trackEvent(name: string, data?: Record<string, unknown>): void;
  abstract trackPageView(url: string): void;
}

// ── Default implementation (console / dev) ───────────────────────────────────
@Injectable()
export class ConsoleAnalyticsAdapter extends AnalyticsAdapter {
  override trackEvent(name: string, data?: Record<string, unknown>): void {
    if (isDevMode()) {
      console.log(`[Analytics] event: ${name}`, data ?? '');
    }
  }

  override trackPageView(url: string): void {
    if (isDevMode()) {
      console.log(`[Analytics] pageView: ${url}`);
    }
  }
}

// ── Provider factory ─────────────────────────────────────────────────────────
// Registers both the concrete class and the abstract alias, so consumers can
// inject AnalyticsAdapter and receive ConsoleAnalyticsAdapter — just like
// HttpClient consumers inject HttpClient and Angular resolves HttpXhrBackend.
export function provideAnalytics(): EnvironmentProviders {
  return makeEnvironmentProviders([
    ConsoleAnalyticsAdapter,
    { provide: AnalyticsAdapter, useExisting: ConsoleAnalyticsAdapter },
  ]);
}
