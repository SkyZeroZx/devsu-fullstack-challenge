import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NgControl } from '@angular/forms';

let nextInputId = 0;

@Component({
  selector: 'app-input-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './input-field.component.html',
  styleUrl: './input-field.component.scss',
  host: {
    class: 'field',
    '[class.field--disabled]': 'disabled()',
  },
})
export class InputFieldComponent implements ControlValueAccessor, OnInit {
  private readonly ngControl = inject(NgControl, {
    self: true,
    optional: true,
  });
  private readonly destroyRef = inject(DestroyRef);

  readonly label = input('');

  readonly type = input<'text' | 'number' | 'password' | 'date'>('text');
  readonly placeholder = input('');
  readonly step = input<string | undefined>(undefined);
  readonly min = input<string | undefined>(undefined);
  readonly readonly = input(false);

  readonly fieldId = `input-field-${++nextInputId}`;

  protected readonly value = signal<unknown>('');
  protected readonly disabled = signal(false);
  protected readonly invalid = signal(false);

  private readonly inputRef =
    viewChild<ElementRef<HTMLInputElement>>('inputRef');

  /* eslint-disable-next-line @typescript-eslint/no-empty-function */
  private onChangeFn: (v: unknown) => void = () => {};
  /* eslint-disable-next-line @typescript-eslint/no-empty-function */
  private onTouchedFn: () => void = () => {};

  constructor() {
    if (this.ngControl) this.ngControl.valueAccessor = this;
  }

  ngOnInit(): void {
    const ctrl = this.ngControl?.control;
    if (!ctrl) return;

    ctrl.statusChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.invalid.set(!!(ctrl.invalid && ctrl.touched)));
  }

  writeValue(val: unknown): void {
    this.value.set(val ?? '');
    const el = this.inputRef()?.nativeElement;
    if (!el) return;
    // Always use the value property to avoid timing issues in tests where
    // the [type] binding may not have been applied to the DOM yet.
    el.value = val != null ? String(val) : '';
  }

  registerOnChange(fn: (v: unknown) => void): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedFn = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  protected onInputChange(event: Event): void {
    const el = event.target as HTMLInputElement;
    const val = this.type() === 'number' ? el.valueAsNumber : el.value;
    this.value.set(val);
    this.onChangeFn(val);
  }

  protected markTouched(): void {
    this.onTouchedFn();
  }
}
