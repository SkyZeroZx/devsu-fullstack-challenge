import {
  AbstractControl,
  ControlValueAccessor,
  FormBuilder,
  NG_VALIDATORS,
  NgControl,
  ReactiveFormsModule,
  TouchedChangeEvent,
  ValidationErrors,
  Validator,
  Validators,
} from '@angular/forms';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  forwardRef,
  inject,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { catchError, filter, of } from 'rxjs';
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
    InputFieldComponent,
    SelectFieldComponent,
    CheckboxFieldComponent,
    ControlErrorModule,
  ],
  templateUrl: './account-form.component.html',
  styleUrl: './account-form.component.scss',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => AccountFormComponent),
      multi: true,
    },
  ],
})
export class AccountFormComponent implements ControlValueAccessor, Validator, OnInit {
  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly destroyRef = inject(DestroyRef);
  private readonly clientService = inject(ClientService);
  private readonly fb = inject(FormBuilder);

  constructor() {
    if (this.ngControl) this.ngControl.valueAccessor = this;
  }

  readonly clients = toSignal(
    this.clientService.getAll({ size: 10 }).pipe(catchError(() => of(null))),
    { initialValue: null },
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

  ngOnInit(): void {
    this.ngControl?.control?.events
      .pipe(
        filter(
          (e): e is TouchedChangeEvent =>
            e instanceof TouchedChangeEvent && e.touched,
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.form.markAllAsTouched());
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
    isDisabled ? this.form.disable() : this.form.enable();
  }

  validate( ): ValidationErrors | null {
    return this.form.valid ? null : { invalidForm: { valid: false } };
  }

}
