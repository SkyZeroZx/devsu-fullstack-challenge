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

let nextSelectId = 0;

@Component({
  selector: 'app-select-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './select-field.component.html',
  styleUrl: './select-field.component.scss',
  host: {
    class: 'field',
    '[class.field--disabled]': 'disabled()',
  },
})
export class SelectFieldComponent implements ControlValueAccessor, OnInit {
  private readonly ngControl = inject(NgControl, {
    self: true,
    optional: true,
  });
  private readonly destroyRef = inject(DestroyRef);

  readonly label = input('');

  readonly fieldId = `select-field-${++nextSelectId}`;

  protected readonly value = signal<unknown>('');
  protected readonly disabled = signal(false);
  protected readonly invalid = signal(false);

  private readonly selectRef =
    viewChild<ElementRef<HTMLSelectElement>>('selectRef');

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
    const el = this.selectRef()?.nativeElement;
    if (el) {
      el.value = String(val ?? '');
    }
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

  protected onSelectChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.value.set(val);
    this.onChangeFn(val);
  }

  protected markTouched(): void {
    this.onTouchedFn();
  }
}
