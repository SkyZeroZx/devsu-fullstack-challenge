import {
  EnvironmentProviders,
  Injectable,
  makeEnvironmentProviders,
} from '@angular/core';
import { ConsoleAnalyticsAdapter } from './console.analytics';
import { GtagAnalyticsAdapter } from './gtag.analytics';

@Injectable({
  providedIn: 'root',
  useExisting: ConsoleAnalyticsAdapter,
})
export abstract class AnalyticsAdapter {
  abstract trackEvent(name: string, data?: Record<string, unknown>): void;
  abstract trackPageView(url: string): void;
}

export function provideAnalytics(): EnvironmentProviders {
  return makeEnvironmentProviders([
    ConsoleAnalyticsAdapter,
    { provide: AnalyticsAdapter, useExisting: ConsoleAnalyticsAdapter },
  ]);
}

export function withGtag(): EnvironmentProviders {
  return makeEnvironmentProviders([
    GtagAnalyticsAdapter,
    { provide: AnalyticsAdapter, useExisting: GtagAnalyticsAdapter },
  ]);
}
