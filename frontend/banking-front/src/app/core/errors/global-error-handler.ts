import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, ErrorHandler, isDevMode, inject } from '@angular/core';
import { Router } from '@angular/router';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly router = inject(Router);

  handleError(error: unknown) {
    let rejection: unknown;
    // Check if it's an error from an HTTP response
    if (!(error instanceof HttpErrorResponse)) {
      rejection = (error as { [key: string]: unknown })?.['rejection']; // get the error object
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const url = this.router.url;

    console.error(GlobalErrorHandler.name, { error, rejection });

    if (!isDevMode()) {
      // Send error to the server or log it in production
    }
  }
}
