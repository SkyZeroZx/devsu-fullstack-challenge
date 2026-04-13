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
  computed,
  forwardRef,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { AccountType } from '@core/interface';
import { ClientService } from '@core/services/client.service';
import { CheckboxFieldComponent } from '@shared/ui/form-field/checkbox-field.component';
import { InputFieldComponent } from '@shared/ui/form-field/input-field.component';
import { SelectFieldComponent } from '@shared/ui/form-field/select-field.component';
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
  private readonly clientService = inject(ClientService);
  private readonly fb = inject(FormBuilder);

  readonly clients = toSignal(
    this.clientService.getAll({ size: 10 }).pipe(catchError(() => of(null))),
    { initialValue: null },
  );

  readonly accountTypeOptions = [
    { value: 'AHORRO' as AccountType, label: 'Ahorro' },
    { value: 'CORRIENTE' as AccountType, label: 'Corriente' },
  ];

  readonly clientOptions = computed(() =>
    (this.clients()?.content ?? []).map((c) => ({
      value: c.clienteId,
      label: c.nombre,
    })),
  );

  readonly form = this.fb.nonNullable.group({
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

  /**
   * Called by the parent edit component via viewChild.
   * Injecting NgControl (self) alongside NG_VALIDATORS causes a circular
   * dependency (NgControl → NG_VALIDATORS → this component), so we expose
   * this method and let the host trigger it directly.
   */
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
