import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { ToastService } from '@shared/ui/toast/toast.service';
import { DialogService } from '@shared/ui/dialog/services/dialog.service';
import { ModalService } from '@shared/ui/modal/services/modal.service';
import { DemoModalContentComponent } from './demo-modal-content.component';

@Component({
  selector: 'app-ui-demo',
  imports: [ButtonComponent],
  templateUrl: './ui-demo.component.html',
  styleUrl: './ui-demo.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiDemoComponent {
  private readonly toastService = inject(ToastService);
  private readonly dialogService = inject(DialogService);
  private readonly modalService = inject(ModalService);

  readonly dialogResult = signal<string>('—');

  // ── Toast demos ──────────────────────────────────────────────
  showSuccessToast() {
    this.toastService.success({
      title: 'Éxito',
      message: 'Operación completada correctamente.',
    });
  }

  showInfoToast() {
    this.toastService.info({
      title: 'Info',
      message: 'Información importante para el usuario.',
    });
  }

  showWarnToast() {
    this.toastService.warn({
      title: 'Advertencia',
      message: 'Revise los datos ingresados.',
    });
  }

  showErrorToast() {
    this.toastService.error({
      title: 'Error',
      message: 'Ocurrió un error inesperado.',
    });
  }

  // ── Dialog demos ─────────────────────────────────────────────
  showConfirmDialog() {
    const instance = this.dialogService.renderDialog({
      title: 'Confirmar acción',
      message: '¿Está seguro de que desea continuar con esta operación?',
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'Cancelar',
    });

    instance.confirmed.subscribe(() => this.dialogResult.set('✓ Confirmado'));
    instance.canceled.subscribe(() => this.dialogResult.set('✗ Cancelado'));
  }

  // ── Modal demos ──────────────────────────────────────────────
  openModal() {
    this.modalService.open(DemoModalContentComponent, { mode: 'modal' });
  }

  openDialog() {
    this.modalService.open(DemoModalContentComponent, {
      mode: 'dialog',
      style: { 'max-width': '500px' },
    });
  }

  openBottomSheet() {
    this.modalService.open(DemoModalContentComponent, { mode: 'bottom-sheet' });
  }
}
