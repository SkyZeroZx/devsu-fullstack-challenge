import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import {
  startWith,
  switchMap,
  catchError,
  of,
  debounceTime,
  distinctUntilChanged,
} from 'rxjs';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { AccountService } from '@core/services/account.service';
import { AccountResponse } from '@core/interface';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { ClickTrackingDirective } from '@shared/directives/click-tracking/click-tracking.directive';
import { ConfirmDialogDirective } from '@shared/ui/dialog/directive/confirm-dialog.directive';
import { ToastService } from '@shared/ui/toast/toast.service';
import { DataTableComponent } from '@shared/ui/data-table/data-table.component';
import { TableColumnDirective } from '@shared/ui/data-table/table-column.directive';

@Component({
  selector: 'app-accounts',
  imports: [
    ReactiveFormsModule,
    ButtonComponent,
    ConfirmDialogDirective,
    RouterLink,
    DecimalPipe,
    DataTableComponent,
    TableColumnDirective,
    ClickTrackingDirective,
  ],
  templateUrl: './accounts.component.html',
  styleUrl: './accounts.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountsComponent {
  private readonly accountService = inject(AccountService);
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

  readonly page = linkedSignal(() => (this.searchTerm(), 0));

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
        this.accountService
          .getAll({ page: page + 1, size: this.pageSize, search: search || undefined })
          .pipe(catchError(() => of(null))),
      ),
    ),
    { initialValue: undefined },
  );

  readonly filteredRows = computed((): AccountResponse[] => this.data()?.content ?? []);

  readonly totalElements = computed(() => this.data()?.totalElements ?? 0);

  onDelete(account: AccountResponse): void {
    this.accountService.delete(account.numeroCuenta).subscribe({
      next: () => {
        this.toast.success({ message: 'Cuenta eliminada' });
        this.refreshTick.update((n) => n + 1);
      },
    });
  }
}
