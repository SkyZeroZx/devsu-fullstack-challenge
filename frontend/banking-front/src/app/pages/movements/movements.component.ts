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
import { DatePipe, DecimalPipe } from '@angular/common';
import { MovementService } from '@core/services/movement.service';
import { MovementResponse } from '@core/interface';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { ClickTrackingDirective } from '@shared/directives/click-tracking/click-tracking.directive';
import { ConfirmDialogDirective } from '@shared/ui/dialog/directive/confirm-dialog.directive';
import { ToastService } from '@shared/ui/toast/toast.service';
import { DataTableComponent } from '@shared/ui/data-table/data-table.component';
import { TableColumnDirective } from '@shared/ui/data-table/table-column.directive';

@Component({
  selector: 'app-movements',
  imports: [
    ReactiveFormsModule,
    ButtonComponent,
    ConfirmDialogDirective,
    RouterLink,
    DatePipe,
    DecimalPipe,
    DataTableComponent,
    TableColumnDirective,
    ClickTrackingDirective,
  ],
  templateUrl: './movements.component.html',
  styleUrl: './movements.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovementsComponent {
  private readonly movementService = inject(MovementService);
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
        this.movementService
          .getAll({ page: page + 1, size: this.pageSize, search: search || undefined })
          .pipe(catchError(() => of(null))),
      ),
    ),
    { initialValue: undefined },
  );

  readonly filteredRows = computed((): MovementResponse[] => this.data()?.content ?? []);

  readonly totalElements = computed(() => this.data()?.totalElements ?? 0);

  onDelete(tx: MovementResponse): void {
    this.movementService.delete(tx.id).subscribe({
      next: () => {
        this.toast.success({ message: 'Movimiento eliminado' });
        this.refreshTick.update((n) => n + 1);
      },
    });
  }
}
