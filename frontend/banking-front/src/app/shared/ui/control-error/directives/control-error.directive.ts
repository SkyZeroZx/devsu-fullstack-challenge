import {
  ComponentRef,
  DestroyRef,
  Directive,
  inject,
  input,
  OnInit,
  ViewContainerRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgControl } from '@angular/forms';

import { ControlErrorContainerDirective } from './control-error-container.directive';
import { ControlErrorComponent } from '../components/control-error.component';
import { FORM_ERRORS } from '../form-error';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[formControl], [formControlName]',
})
export class ControlErrorsDirective implements OnInit {
  private ref!: ComponentRef<ControlErrorComponent>;
  container: ViewContainerRef;

  readonly customErrors = input<{ [key: string]: string }>({});
  private readonly destroyRef = inject(DestroyRef);
  private readonly _vcr = inject(ViewContainerRef);
  private readonly ngControl = inject(NgControl);
  private readonly errors = inject(FORM_ERRORS);
  private readonly controlErrorContainer = inject(
    ControlErrorContainerDirective,
    { optional: true },
  );

  constructor() {
    this.container = this.controlErrorContainer
      ? this.controlErrorContainer.vcr
      : this._vcr;
  }

  ngOnInit() {
    this.control?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        const controlErrors = this.control?.errors;
        if (controlErrors) {
          const firstKey = Object.keys(controlErrors)[0];
          const getError = this.errors[firstKey];
          const customText = this.customErrors()[firstKey];
          // Skip error keys that have no registered handler (e.g. composite
          // form validators like `invalidForm` from nested CVA components).
          const text = customText ?? (getError ? getError(controlErrors[firstKey]) : null);
          if (text) {
            this.setError(text);
          } else if (this.ref) {
            this.setError(null);
          }
        } else if (this.ref) {
          this.setError(null);
        }
      });
  }

  get control() {
    return this.ngControl.control;
  }

  setError(text: string | null) {
    if (!this.ref) {
      this.ref = this.container.createComponent(ControlErrorComponent);
    }

    this.ref.setInput('text', text);
  }
}
