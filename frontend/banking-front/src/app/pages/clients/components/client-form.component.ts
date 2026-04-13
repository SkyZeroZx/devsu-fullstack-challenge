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
  signal,
} from '@angular/core';
import { CheckboxFieldComponent } from '@shared/ui/form-field/checkbox-field/checkbox-field.component';
import { InputFieldComponent } from '@shared/ui/form-field/input-field/input-field.component';
import { SelectFieldComponent } from '@shared/ui/form-field/select-field/select-field.component';
import { ControlErrorModule } from '@shared/ui/control-error/control-error.module';

@Component({
  selector: 'app-client-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    InputFieldComponent,
    SelectFieldComponent,
    CheckboxFieldComponent,
    ControlErrorModule,
  ],
  templateUrl: './client-form.component.html',
  styleUrl: './client-form.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ClientFormComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => ClientFormComponent),
      multi: true,
    },
  ],
})
export class ClientFormComponent implements ControlValueAccessor, Validator {
  private readonly fb = inject(FormBuilder);

  readonly genderOptions = [
    { value: 'MASCULINO', label: 'Masculino' },
    { value: 'FEMENINO', label: 'Femenino' },
    { value: 'OTRO', label: 'Otro' },
  ];

  readonly showPassword = signal(true);

  readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    genero: ['', Validators.required],
    edad: [0, [Validators.required, Validators.min(1)]],
    identificacion: ['', [Validators.required, Validators.maxLength(20)]],
    direccion: ['', Validators.required],
    telefono: ['', Validators.required],
    contrasena: ['', [Validators.required, Validators.minLength(4)]],
    estado: [true],
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
      this.form.controls.contrasena.disable({ emitEvent: false });
      this.showPassword.set(false);
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
}
