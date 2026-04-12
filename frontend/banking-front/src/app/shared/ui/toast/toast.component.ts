import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
} from '@angular/core';
import { ToastData } from './interface/toast.interface';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./toast.component.scss'],
})
export class ToastComponent {
  protected data = signal<ToastData>({
    message: '',
  });
  protected closing = signal(false);

  private readonly delayEaseOut = 500;
  private readonly toastElement = inject<ElementRef<HTMLElement>>(ElementRef);

  open(data: ToastData) {
    this.data.set(data);
    this.closing.set(false);
    this.countDown(data?.timeout);
  }

  hide() {
    this.closing.set(true);
    this.data.update((value) => ({
      ...value,
      show: false,
    }));

    setTimeout(() => {
      this.remove();
    }, this.delayEaseOut);
  }

  countDown(timeout = 3000) {
    setTimeout(() => {
      this.hide();
    }, timeout - this.delayEaseOut);

    setTimeout(() => {
      this.remove();
    }, timeout);
  }

  private remove() {
    this.toastElement.nativeElement.remove();
  }
}
