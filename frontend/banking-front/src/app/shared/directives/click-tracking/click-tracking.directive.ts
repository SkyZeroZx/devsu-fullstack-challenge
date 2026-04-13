import { Directive, inject, input } from '@angular/core';
import { AnalyticsAdapter } from '@core/services/analytics/analytics.adapter';

@Directive({
  selector: '[appClickTracking]',
  host: {
    '(click)': 'onTrackingClick()',
  },
})
export class ClickTrackingDirective {
  private readonly analytics = inject(AnalyticsAdapter);
  readonly eventName = input.required<string>();

  readonly eventData = input<object>();

  onTrackingClick() {
    this.analytics.trackEvent(
      this.eventName(),
      this.eventData() as Record<string, unknown>,
    );
  }
}
