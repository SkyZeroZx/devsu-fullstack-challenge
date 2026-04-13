import { Directive, inject, model, output } from '@angular/core';
import { DialogService } from '../services/dialog.service';

@Directive({
  selector: '[appConfirmDialog]',
  host: {
    '(click)': 'onClick($event)',
  },
})
export class ConfirmDialogDirective {
  private readonly dialogService = inject(DialogService);

  readonly message = model<string>('¿ Esta seguro ?');

  readonly confirmButtonText = model<string>('Confirmar');

  readonly cancelButtonText = model<string>('Cancelar');

  readonly title = model<string>('Title');

  readonly confirm = output<void>();

  // eslint-disable-next-line @angular-eslint/no-output-native
  readonly cancel = output<void>();

  private existDialog = false;

  async onClick(event: MouseEvent) {
    event?.preventDefault();

    event?.stopPropagation();

    if (this.existDialog) {
      return;
    }

    this.showDialog();
  }

  showDialog() {
    this.existDialog = true;

    const instance = this.dialogService.renderDialog({
      title: this.title(),
      message: this.message(),
      cancelButtonText: this.cancelButtonText(),
      confirmButtonText: this.confirmButtonText(),
    });

    instance.canceled.subscribe(() => {
      this.existDialog = false;
      this.cancel.emit();
    });

    instance.confirmed.subscribe(() => {
      this.existDialog = false;
      this.confirm.emit();
    });
  }
}
