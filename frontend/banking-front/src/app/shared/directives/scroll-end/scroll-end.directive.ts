import {
  DestroyRef,
  Directive,
  ElementRef,
  afterNextRender,
  inject,
  output,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';

@Directive({
  selector: '[appScrollEnd]',
})
export class ScrollEndDirective {
  readonly nearEnd = output<void>();

  private readonly el: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      const element = this.el.nativeElement;

      fromEvent(element, 'scroll', { passive: true })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          const { scrollTop, scrollHeight, clientHeight } = element;
          const remainingScroll = scrollHeight - scrollTop - clientHeight;

          if (remainingScroll < scrollHeight / 3) {
            this.nearEnd.emit();
          }
        });
    });
  }
}
