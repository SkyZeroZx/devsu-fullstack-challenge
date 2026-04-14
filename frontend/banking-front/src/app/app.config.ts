import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { appRoutes } from './app.routes';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { globalErrorHandler } from '@core/errors';
import { provideServiceWorker } from '@angular/service-worker';
import { swRegistrationOptions } from '@core/config/service-worker';
import { authInterceptor } from '@core/interceptors/auth.interceptor';
import { errorInterceptor } from '@core/interceptors/error.interceptor';
import { provideAnalytics } from '@core/services/analytics/analytics.adapter';
import { provideToast } from '@shared/ui/toast/toast.provider';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes, withComponentInputBinding()),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor, errorInterceptor]),
    ),
    globalErrorHandler,
    provideServiceWorker('ngsw-worker.js', swRegistrationOptions),
    provideAnalytics(),
    provideToast(),
  ],
};
