import { Directive, input } from '@angular/core';

/**
 * Applied to `<input type="number">` elements to prevent decimal values.
 * Blocks `.`, `,`, `e`, `E` on keydown and strips any fractional part
 * that still enters via paste or drag-and-drop.
 *
 * Usage:
 *   <input appIntegerOnly />               — always active
 *   <input [appIntegerOnly]="isInteger" /> — conditionally active
 */
@Directive({
  selector: 'input[appIntegerOnly]',
  host: {
    '(keydown)': 'onKeyDown($event)',
    '(input)': 'onInput($event)',
    '(paste)': 'onPaste($event)',
  },
})
export class IntegerOnlyDirective {
  /** When bound to false/null the directive is inactive. Defaults to true. */
  readonly appIntegerOnly = input<boolean | null | ''>(true);

  private get active(): boolean {
    const v = this.appIntegerOnly();
    return v !== false && v !== null;
  }

  onKeyDown(event: KeyboardEvent): void {
    if (
      this.active &&
      (event.key === '.' ||
        event.key === ',' ||
        event.key === 'e' ||
        event.key === 'E')
    ) {
      event.preventDefault();
    }
  }

  onInput(event: Event): void {
    if (!this.active) return;
    const el = event.target as HTMLInputElement;
    if (el.value.includes('.')) {
      el.value = String(Math.trunc(el.valueAsNumber));
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  onPaste(event: ClipboardEvent): void {
    if (!this.active) return;
    const text = event.clipboardData?.getData('text') ?? '';
    if (/[.,eE]/.test(text)) {
      event.preventDefault();
      const sanitized = String(Math.trunc(Number(text.replace(',', '.'))));
      if (!isNaN(Number(sanitized))) {
        (event.target as HTMLInputElement).value = sanitized;
        (event.target as HTMLInputElement).dispatchEvent(
          new Event('input', { bubbles: true }),
        );
      }
    }
  }
}
