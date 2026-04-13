import { FormArray, FormControl, FormGroup } from '@angular/forms';

/**
 * Maps any interface T into a strongly-typed FormGroup.
 *
 * Inspired by:
 * https://medium.com/@nexsol-tech/angular-use-any-existing-interface-into-strongly-typed-reactive-form-90a6ab672b37
 *
 * Rules:
 *  - Primitives (string, number, boolean, enums) → FormControl<T[K]>
 *  - Date                                        → FormControl<Date>  (Date extends object, so must be checked first)
 *  - Array<V>                                    → FormArray<FormType<V>>
 *  - Nested object                               → FormType<T[K]>     (recursive)
 *
 * Designed for use with `fb.nonNullable.group()`, so controls are non-nullable.
 *
 * Usage:
 * ```typescript
 * readonly form: FormType<AuthRequest> = this.fb.nonNullable.group({ ... });
 * ```
 *
 * With Partial / Pick / Omit:
 * ```typescript
 * readonly form: FormType<Pick<AccountRequest, 'tipoCuenta' | 'estado'>> = ...
 * ```
 */
export type FormType<T> = FormGroup<{
  [K in keyof T]-?: T[K] extends Date
    ? FormControl<T[K]>
    : T[K] extends (infer V)[]
      ? FormArray<V extends object ? FormType<V> : FormControl<V>>
      : T[K] extends object
        ? FormType<T[K]>
        : FormControl<T[K]>;
}>;
