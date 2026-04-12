import { Injectable, DOCUMENT, inject } from '@angular/core';

import { ConfirmDialogComponent } from '../components';
import { ConfirmDialogOptions } from '../interfaces';
import { injectDomPortal } from '../../utils/inject-portal';
import { onRouterNavigateClean } from '../../utils/router-navigate-clean';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  private readonly document = inject(DOCUMENT);
  private readonly domPortal = injectDomPortal();

  instancesDialog: ConfirmDialogComponent[] = [];

  constructor() {
    onRouterNavigateClean(() => this.closeInstanceDialog());
  }

  closeInstanceDialog() {
    // Avoid performance issues by closing all dialogs when navigating to a new route
    this.instancesDialog.map((instance) => instance.removeConfirmDialog());
    this.instancesDialog = [];
  }

  renderDialog(dialogOptions: ConfirmDialogOptions) {
    const confirmDialogComponent = this.domPortal.attachRoot(
      ConfirmDialogComponent,
    );

    const { instance } = confirmDialogComponent;

    instance.confirmDialogOptions.set({
      message: dialogOptions.message,
      title: dialogOptions.title,
      confirmButtonText: dialogOptions.confirmButtonText,
      cancelButtonText: dialogOptions.cancelButtonText,
    });

    const htmlBaseElement = this.document.getElementsByTagName('html')[0];
    htmlBaseElement.style.overflowY = 'hidden';

    instance.confirmed.subscribe(() => {
      htmlBaseElement.style.overflow = 'visible';
    });

    instance.canceled.subscribe(() => {
      htmlBaseElement.style.overflow = 'visible';
    });

    this.instancesDialog.push(instance);

    return instance;
  }
}
