import { InjectionToken } from '@angular/core';
import { ToastConfig } from '../interface/toast.interface';

export const TOAST_CONFIG = new InjectionToken<ToastConfig>('ToastConfig');
