import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  model,
  output,
  viewChild,
} from '@angular/core';
import { ConfirmDialogOptions } from '../../interfaces';
import { DialogService } from '../../services/dialog.service';
import { ButtonComponent } from '../../../button/button.component';

@Component({
  selector: 'app-confirm-dialog',
  imports: [ButtonComponent],
  templateUrl: './confirm-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./confirm-dialog.component.scss'],
  host: {
    '(document:keydown.escape)': 'cancel()',
  },
})
export class ConfirmDialogComponent {
  private readonly dialogService = inject(DialogService);

  private readonly confirmDialogElement =
    inject<ElementRef<HTMLElement>>(ElementRef);

  private readonly dialogCard =
    viewChild.required<ElementRef<HTMLElement>>('dialogCard');

  readonly confirmDialogOptions = model<ConfirmDialogOptions>();

  readonly canceled = output<void>();

  readonly confirmed = output<void>();

  constructor() {
    afterNextRender(() => {
      this.dialogCard().nativeElement.focus();
    });
  }

  onOverlayClick(event: MouseEvent) {
    const card = this.dialogCard().nativeElement;
    if (card && !card.contains(event.target as Node)) {
      this.cancel();
    }
  }

  cancel() {
    this.canceled.emit();
    this.removeConfirmDialog();
  }

  confirm() {
    this.confirmed.emit();
    this.removeConfirmDialog();
  }

  removeConfirmDialog() {
    this.confirmDialogElement.nativeElement.remove();
    this.dialogService.instancesDialog.pop();
  }
}
