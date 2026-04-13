import {
  ControlValueAccessor,
  FormBuilder,
  FormsModule,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  ValidationErrors,
  Validator,
  Validators,
} from '@angular/forms';
import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  inject,
} from '@angular/core';
import { AccountRequest, AccountType, FormType } from '@core/interface';
import { CheckboxFieldComponent } from '@shared/ui/form-field/checkbox-field/checkbox-field.component';
import { InputFieldComponent } from '@shared/ui/form-field/input-field/input-field.component';
import { SelectFieldComponent } from '@shared/ui/form-field/select-field/select-field.component';
import { ClientSelectFieldComponent } from '@shared/ui/form-field/client-select-field/client-select-field.component';
import { ControlErrorModule } from '@shared/ui/control-error/control-error.module';

@Component({
  selector: 'app-account-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    InputFieldComponent,
    SelectFieldComponent,
    CheckboxFieldComponent,
    ClientSelectFieldComponent,
    ControlErrorModule,
  ],
  templateUrl: './account-form.component.html',
  styleUrl: './account-form.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AccountFormComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => AccountFormComponent),
      multi: true,
    },
  ],
})
export class AccountFormComponent implements ControlValueAccessor, Validator {
  private readonly fb = inject(FormBuilder);

  readonly accountTypeOptions = [
    { value: 'AHORRO' as AccountType, label: 'Ahorro' },
    { value: 'CORRIENTE' as AccountType, label: 'Corriente' },
  ];

  readonly form: FormType<AccountRequest> = this.fb.nonNullable.group({
    numeroCuenta: ['', Validators.required],
    tipoCuenta: ['' as AccountType, Validators.required],
    saldoInicial: [0, [Validators.required, Validators.min(0)]],
    estado: [true],
    clienteId: ['', Validators.required],
  });

  /* eslint-disable-next-line @typescript-eslint/no-empty-function */
  onTouchedFn: () => void = () => {};
  /* eslint-disable-next-line @typescript-eslint/no-empty-function */
  onChangeFn: (val: unknown) => void = () => {};

  markAllAsTouched(): void {
    this.form.markAllAsTouched();
  }

  writeValue(val: Record<string, unknown> | null): void {
    if (val) {
      this.form.patchValue(val, { emitEvent: false });
      this.form.controls.numeroCuenta.disable({ emitEvent: false });
      this.form.controls.clienteId.disable({ emitEvent: false });
    }
  }

  registerOnChange(fn: (val: unknown) => void): void {
    this.onChangeFn = fn;
    this.form.valueChanges.subscribe(() => fn(this.form.getRawValue()));
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedFn = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.form.disable();
    } else {
      this.form.enable();
    }
  }

  validate(): ValidationErrors | null {
    return this.form.valid ? null : { invalidForm: { valid: false } };
  }
}
