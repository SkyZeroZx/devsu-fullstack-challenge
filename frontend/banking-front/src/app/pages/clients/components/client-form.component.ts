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
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { CheckboxFieldComponent } from '@shared/ui/form-field/checkbox-field.component';
import { InputFieldComponent } from '@shared/ui/form-field/input-field.component';
import { SelectFieldComponent } from '@shared/ui/form-field/select-field.component';
import { ControlErrorModule } from '@shared/ui/control-error/control-error.module';

@Component({
  selector: 'app-client-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    InputFieldComponent,
    SelectFieldComponent,
    CheckboxFieldComponent,
    ControlErrorModule,
  ],
  templateUrl: './client-form.component.html',
  styleUrl: './client-form.component.scss',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => ClientFormComponent),
      multi: true,
    },
  ],
})
export class ClientFormComponent implements ControlValueAccessor, Validator, OnInit {
  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);

  constructor() {
    if (this.ngControl) this.ngControl.valueAccessor = this;
  }

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

  onTouchedFn: () => void = () => {};
  private onChangeFn: (val: unknown) => void = () => {};

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
    isDisabled ? this.form.disable() : this.form.enable();
  }

  validate(): ValidationErrors | null {
    return this.form.valid ? null : { invalidForm: { valid: false } };
  }

}
