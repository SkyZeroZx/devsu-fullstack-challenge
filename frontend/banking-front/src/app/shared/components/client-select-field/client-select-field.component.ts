import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  inject,
  input,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { ClientService } from '@core/services/client/client.service';
import { ClientResponse } from '@core/interface';
import { SelectFieldComponent } from '../../ui/form-field/select-field/select-field.component';
import { BasePagedSelectComponent } from '../base-paged-select';
 

@Component({
  selector: 'app-client-select',
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
      useExisting: forwardRef(() => ClientSelectFieldComponent),
      multi: true,
    },
  ],
})
export class ClientSelectFieldComponent extends BasePagedSelectComponent<ClientResponse> {
  readonly label = input('Cliente');
  readonly placeholder = input('Seleccione cliente');

  constructor() {
    const clientService = inject(ClientService);
    super(
      (page, search) =>
        clientService
          .getAll({ page, size: 20, ...(search ? { search } : {}) })
          .pipe(catchError(() => of(null))),
      (c) => ({ value: c.clienteId, label: c.nombre }),
    );
  }
}
