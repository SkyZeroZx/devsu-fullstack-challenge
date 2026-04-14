import { Injectable, isDevMode } from '@angular/core';
import { AnalyticsAdapter } from './analytics.adapter';

@Injectable({ providedIn: 'root' })
export class ConsoleAnalyticsAdapter implements AnalyticsAdapter {
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
