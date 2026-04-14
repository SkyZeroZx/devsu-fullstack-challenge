import { DOCUMENT, inject, Injectable, PLATFORM_ID } from '@angular/core';
import { AnalyticsAdapter } from './analytics.adapter';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class GtagAnalyticsAdapter implements AnalyticsAdapter {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly document = inject(DOCUMENT);

  trackEvent(name: string, data?: Record<string, unknown>): void {
    if (!this.isBrowser) return;
    (window as any)?.gtag?.('event', name, { ...(data ?? {}) });
  }

  trackPageView(): void {
    if (!this.isBrowser) return;
    const title = this.document.title;
    const page_location = `${location.protocol}//${location.host}${location.pathname}`;
    (window as any)?.gtag?.('event', 'page_view', {
      page_title: title,
      page_location,
    });
  }
}
