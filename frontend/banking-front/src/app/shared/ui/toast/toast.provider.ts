import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { ToastConfig } from './interface/toast.interface';
import { TOAST_CONFIG } from './token/toastr.token';

export const provideToast = (
  config: Partial<ToastConfig> = {},
): EnvironmentProviders => {
  return makeEnvironmentProviders([
    {
      provide: TOAST_CONFIG,
      useValue: { config },
    },
  ]);
};
