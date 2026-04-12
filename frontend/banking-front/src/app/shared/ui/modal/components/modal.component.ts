import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  computed,
  model,
  signal,
  DOCUMENT,
  output,
  inject,
} from '@angular/core';
import { FADE_ANIMATION_DELAY } from '../constants/animation.constant';
import { ModalService } from '../services/modal.service';

@Component({
  selector: 'app-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent implements OnInit {
  protected show = signal<boolean>(true);

  readonly mode = model<'dialog' | 'modal' | 'bottom-sheet'>('modal');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  style = model<{ [k: string]: any }>({});

  setting = computed(() => ({
    isModal: this.mode() === 'modal',
    isDialog: this.mode() === 'dialog',
    isBottomSheet: this.mode() === 'bottom-sheet',
  }));

  closed = output<void>();

  private htmlBaseElement!: HTMLHtmlElement;

  private readonly modalHost = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly document = inject(DOCUMENT);
  private readonly renderer2 = inject(Renderer2);
  private readonly modalService = inject(ModalService);

  ngOnInit(): void {
    this.hiddenScroll();
  }

  private hiddenScroll() {
    this.htmlBaseElement = this.document.getElementsByTagName('html')[0];
    this.htmlBaseElement.style.overflowY = 'hidden';
  }

  private addScroll() {
    if (this.modalService.listModalComponentRef.length === 0) {
      this.renderer2.setStyle(this.htmlBaseElement, 'overflowY', 'visible');
    }
  }

  open() {
    this.show.set(true);
  }

  close() {
    this.show.set(false);

    setTimeout(() => {
      this.remove();
    }, FADE_ANIMATION_DELAY);
  }

  remove() {
    this.closed.emit();
    this.modalHost.nativeElement.remove();
    this.addScroll();
  }
}
