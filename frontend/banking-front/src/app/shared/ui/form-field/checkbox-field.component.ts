import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

let nextCheckboxId = 0;

@Component({
  selector: 'app-checkbox-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxFieldComponent),
      multi: true,
    },
  ],
  templateUrl: './checkbox-field.component.html',
  styleUrl: './checkbox-field.component.scss',
  host: {
    class: 'field',
    '[class.field--disabled]': 'disabled()',
  },
})
export class CheckboxFieldComponent implements ControlValueAccessor {
  readonly label = input('');

  readonly fieldId = `checkbox-field-${++nextCheckboxId}`;

  protected readonly value = signal(false);
  protected readonly disabled = signal(false);

  private onChangeFn: (v: boolean) => void = () => {};
  private onTouchedFn: () => void = () => {};

  writeValue(val: unknown): void {
    this.value.set(!!val);
  }

  registerOnChange(fn: (v: boolean) => void): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedFn = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  protected onCheckboxChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.value.set(checked);
    this.onChangeFn(checked);
  }

  protected markTouched(): void {
    this.onTouchedFn();
  }
}
