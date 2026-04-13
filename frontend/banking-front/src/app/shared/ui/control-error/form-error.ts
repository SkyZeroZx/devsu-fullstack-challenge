import { InjectionToken } from '@angular/core';
import { ControlErrors } from './interface/control-error.interface';

export const defaultErrors: ControlErrors<unknown> = {
  required: () => `Este campo es requerido`,
  min: () => `Este campo no cumple el valor minimo`,
  max: () => `Este campo excede el valor maximo`,
  minlength: ({ requiredLength } :any) =>
    `Se requiere minimo ${requiredLength} caracteres`,
  maxlength: ({ requiredLength } :any) =>
    `El maximo de caracteres permitos es ${requiredLength}`,
  pattern: () => `Este campo no cumple con la estructura requerida`,
  email: () => 'Debe ingresar un email valido',
};

export const FORM_ERRORS = new InjectionToken('FORM_ERRORS', {
  factory: () => defaultErrors,
});
