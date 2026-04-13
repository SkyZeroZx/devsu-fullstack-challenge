import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  startWith,
  switchMap,
  catchError,
  of,
  debounceTime,
  distinctUntilChanged,
} from 'rxjs';
import { RouterLink } from '@angular/router';
import { ClientService } from '@core/services/client/client.service';
import { ClientResponse } from '@core/interface';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { ClickTrackingDirective } from '@shared/directives/click-tracking/click-tracking.directive';
import { ConfirmDialogDirective } from '@shared/ui/dialog/directive/confirm-dialog.directive';
import { ToastService } from '@shared/ui/toast/toast.service';
import { DataTableComponent } from '@shared/ui/data-table/data-table.component';
import { TableColumnDirective } from '@shared/ui/data-table/table-column.directive';
import { IconComponent } from '@shared/ui/icon/icon.component';

@Component({
  selector: 'app-clients',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    ButtonComponent,
    ConfirmDialogDirective,
    RouterLink,
    DataTableComponent,
    TableColumnDirective,
    ClickTrackingDirective,
    IconComponent,
  ],
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientsComponent {
  private readonly clientService = inject(ClientService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly pageSize = 10;
  readonly search = this.fb.nonNullable.control('');

  private readonly searchTerm = toSignal(
    this.search.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
    ),
    { initialValue: '' },
  );

  // Resets to 1 whenever the search term changes (declared after searchTerm)
  readonly page = linkedSignal(() => (this.searchTerm(), 1));

  private readonly refreshTick = signal(0);

  private readonly loadTrigger = computed(() => ({
    page: this.page(),
    search: this.searchTerm(),
    _: this.refreshTick(),
  }));

  readonly data = toSignal(
    toObservable(this.loadTrigger).pipe(
      debounceTime(0),
      switchMap(({ page, search }) =>
        this.clientService
          .getAll({
            page: page,
            size: this.pageSize,
            search: search || undefined,
          })
          .pipe(catchError(() => of(null))),
      ),
    ),
    { initialValue: undefined },
  );

  readonly filteredRows = computed(
    (): ClientResponse[] => this.data()?.content ?? [],
  );

  readonly totalElements = computed(() => this.data()?.totalElements ?? 0);

  onDelete(client: ClientResponse): void {
    this.clientService.delete(client.clienteId).subscribe({
      next: () => {
        this.toast.success({ message: 'Cliente eliminado' });
        this.refreshTick.update((n) => n + 1);
      },
    });
  }
}
