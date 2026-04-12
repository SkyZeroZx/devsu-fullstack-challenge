import { inject, Injectable } from '@angular/core';

import { ToastTypes } from './constant/toast.enum';
import { ToastData } from './interface/toast.interface';
import { ToastComponent } from './toast.component';
import { TOAST_CONFIG } from './token/toastr.token';
import { injectDomPortal } from '../utils/inject-portal';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly domPortal = injectDomPortal();
  private readonly toastConfig = inject(TOAST_CONFIG);

  success(toastData: ToastData) {
    const data = {
      show: true,
      type: ToastTypes.success,
      ...this.toastConfig,
      ...toastData,
    };
    this.createToastComponent(data);
  }

  info(toastData: ToastData) {
    const data = {
      show: true,
      type: ToastTypes.info,
      ...this.toastConfig,
      ...toastData,
    };
    this.createToastComponent(data);
  }

  error(toastData: ToastData) {
    const data = {
      show: true,
      type: ToastTypes.error,
      ...this.toastConfig,
      ...toastData,
    };
    this.createToastComponent(data);
  }

  warn(toastData: ToastData) {
    const data = {
      show: true,
      type: ToastTypes.warn,
      ...this.toastConfig,
      ...toastData,
    };
    this.createToastComponent(data);
  }

  private createToastComponent(data: ToastData) {
    const componentRef = this.domPortal.attachRoot(ToastComponent);
    componentRef.instance.open(data);
  }
}
