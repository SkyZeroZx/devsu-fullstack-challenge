import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { globalErrorHandler } from './core/errors';
import { provideServiceWorker } from '@angular/service-worker';
import { swRegistrationOptions } from './core/config/service-worker';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    provideHttpClient(withFetch()),
    globalErrorHandler,
    provideServiceWorker('ngsw-worker.js', swRegistrationOptions),
  ],
};
