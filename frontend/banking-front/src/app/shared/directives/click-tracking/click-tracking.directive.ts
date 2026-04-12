import { Directive, inject, input } from '@angular/core';
import { AnalyticsService } from '../../../core/services/analytics.service';

@Directive({
  selector: '[appClickTracking]',
  host: {
    '(click)': 'onTrackingClick()',
  },
})
export class ClickTrackingDirective {
  private readonly analyticService = inject(AnalyticsService);
  readonly eventName = input.required<string>();

  readonly eventData = input<object>();

  onTrackingClick() {
    this.analyticService.trackEvent({
      eventName: this.eventName(),
      ...this.eventData(),
    });
  }
}
