import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  inject,
  input,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { AccountService } from '@core/services/account/account.service';
import { AccountResponse } from '@core/interface';
import { SelectFieldComponent } from '../../ui/form-field/select-field/select-field.component';
import { BasePagedSelectComponent } from '../base-paged-select';

@Component({
  selector: 'app-account-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SelectFieldComponent, ReactiveFormsModule],
  template: `
    <app-select-field
      [formControl]="innerCtrl"
      [label]="label()"
      [placeholder]="placeholder()"
      [options]="options()"
      (searchChange)="onSearch($event)"
      (nearEnd)="onScrollEnd()"
    />
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AccountSelectFieldComponent),
      multi: true,
    },
  ],
})
export class AccountSelectFieldComponent extends BasePagedSelectComponent<AccountResponse> {
  readonly label = input('Cuenta');
  readonly placeholder = input('Seleccione cuenta');

  constructor() {
    const accountService = inject(AccountService);
    super(
      (page, search) =>
        accountService
          .getAll({ page, size: 20, ...(search ? { search } : {}) })
          .pipe(catchError(() => of(null))),
      (a) => ({
        value: a.numeroCuenta,
        label: `${a.numeroCuenta} — ${a.cliente}`,
      }),
    );
  }
}
