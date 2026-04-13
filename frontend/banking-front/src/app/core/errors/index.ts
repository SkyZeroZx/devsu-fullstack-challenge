import { ErrorHandler, Provider } from '@angular/core';
import { GlobalErrorHandler } from './global-error-handler';

export const globalErrorHandler: Provider = {
  provide: ErrorHandler,
  useClass: GlobalErrorHandler,
};
