import {
  EnvironmentProviders,
  inject,
  Injectable,
  InjectionToken,
  isDevMode,
  makeEnvironmentProviders,
} from '@angular/core';

// ── Abstract adapter (DI contract) ──────────────────────────────────────
export abstract class AnalyticsAdapter {
  abstract trackEvent(name: string, data?: Record<string, unknown>): void;
  abstract trackPageView(url: string): void;
}

export const ANALYTICS_ADAPTER = new InjectionToken<AnalyticsAdapter>(
  'AnalyticsAdapter',
);

// ── Console implementation (dev / dummy) ────────────────────────────────
@Injectable()
export class ConsoleAnalyticsAdapter extends AnalyticsAdapter {
  trackEvent(name: string, data?: Record<string, unknown>): void {
    if (isDevMode()) {
      console.log(`[Analytics] event: ${name}`, data ?? '');
    }
  }

  trackPageView(url: string): void {
    if (isDevMode()) {
      console.log(`[Analytics] pageView: ${url}`);
    }
  }
}

// ── Provider factory ────────────────────────────────────────────────────
export function provideAnalytics(): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: ANALYTICS_ADAPTER, useClass: ConsoleAnalyticsAdapter },
  ]);
}

// ── Convenience service that delegates to the adapter ───────────────────
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly adapter = inject(ANALYTICS_ADAPTER);

  trackEvent(name: string, data?: Record<string, unknown>): void {
    this.adapter.trackEvent(name, data);
  }

  trackPageView(url: string): void {
    this.adapter.trackPageView(url);
  }
}
