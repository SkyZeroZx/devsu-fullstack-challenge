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

/**
 * Emits `nearEnd` when the user scrolls close to the bottom of the host element.
 *
 * Useful for implementing **infinite scroll** on scrollable containers such as
 * dropdown lists. The directive listens to the `scroll` event on the host element
 * and fires when the remaining scrollable distance is less than one-third of the
 * container's scroll height.
 *
 * Since the application runs in **zoneless** mode, there is no need for
 * `NgZone.runOutsideAngular` — scroll listeners do not trigger unnecessary
 * change detection by default.
 *
 * @example
 * ```html
 * <ul class="options-list" scrollEnd (nearEnd)="loadMore()">
 *   @for (opt of options(); track opt.value) {
 *     <li>{{ opt.label }}</li>
 *   }
 * </ul>
 * ```
 */
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
