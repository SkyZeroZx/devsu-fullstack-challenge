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
import { MovementType } from '@core/interface';
import { AccountService } from '@core/services/account.service';
import { InputFieldComponent } from '@shared/ui/form-field/input-field.component';
import { SelectFieldComponent } from '@shared/ui/form-field/select-field.component';
import { ControlErrorModule } from '@shared/ui/control-error/control-error.module';

@Component({
  selector: 'app-movement-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    InputFieldComponent,
    SelectFieldComponent,
    ControlErrorModule,
  ],
  templateUrl: './movement-form.component.html',
  styleUrl: './movement-form.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MovementFormComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => MovementFormComponent),
      multi: true,
    },
  ],
})
export class MovementFormComponent implements ControlValueAccessor, Validator {
  private readonly accountService = inject(AccountService);
  private readonly fb = inject(FormBuilder);

  readonly accounts = toSignal(
    this.accountService.getAll({ size: 10 }).pipe(catchError(() => of(null))),
    { initialValue: null },
  );

  readonly movementTypeOptions = [
    { value: 'CREDITO' as MovementType, label: 'Crédito' },
    { value: 'DEBITO' as MovementType, label: 'Débito' },
  ];

  readonly accountOptions = computed(() =>
    (this.accounts()?.content ?? []).map((a) => ({
      value: a.numeroCuenta,
      label: `${a.numeroCuenta} — ${a.cliente}`,
    })),
  );

  readonly form = this.fb.nonNullable.group({
    numeroCuenta: ['', Validators.required],
    tipoMovimiento: ['' as MovementType, Validators.required],
    valor: [0, [Validators.required, Validators.min(0.01)]],
  });

  /* eslint-disable-next-line @typescript-eslint/no-empty-function */
  onTouchedFn: () => void = () => {};
  /* eslint-disable-next-line @typescript-eslint/no-empty-function */
  onChangeFn: (val: unknown) => void = () => {};

  writeValue(val: Record<string, unknown> | null): void {
    if (val) {
      this.form.patchValue(val, { emitEvent: false });
    }
  }

  registerOnChange(fn: (val: unknown) => void): void {
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

  markAllAsTouched(): void {
    this.form.markAllAsTouched();
  }
}
