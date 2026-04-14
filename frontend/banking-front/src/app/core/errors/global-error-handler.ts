import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, ErrorHandler, isDevMode, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AnalyticsAdapter } from '../services/analytics/analytics.adapter';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly router = inject(Router);
  private readonly analytics = inject(AnalyticsAdapter);

  handleError(error: unknown) {
    let rejection: unknown;
    // Check if it's an error from an HTTP response
    if (!(error instanceof HttpErrorResponse)) {
      rejection = (error as { [key: string]: unknown })?.['rejection']; // get the error object
    }

    const url = this.router.url;

    console.error(GlobalErrorHandler.name, { error, rejection });

    if (!isDevMode()) {
      this.analytics.trackEvent('error', {
        error: error instanceof Error ? error.message : String(error),
        url,
      });
    }
  }
}
