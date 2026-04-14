import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  catchError,
  debounceTime,
  filter,
  finalize,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { ReportService } from '@core/services/report/report.service';
import {
  FormType,
  PagedResponse,
  ReportFilterForm,
  ReportParams,
  ReportRow,
} from '@core/interface';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { ClickTrackingDirective } from '@shared/directives/click-tracking/click-tracking.directive';
import { InputFieldComponent } from '@shared/ui/form-field/input-field/input-field.component';
import { ClientSelectFieldComponent } from '@shared/components/client-select-field/client-select-field.component';
import { DecimalPipe } from '@angular/common';
import { ControlErrorModule } from '@app/shared/ui/control-error/control-error.module';
import { DataTableComponent } from '@shared/ui/data-table/data-table.component';
import { TableColumnDirective } from '@shared/ui/data-table/table-column.directive';
import { IconComponent } from '@app/shared/ui/icon/icon.component';
import { defaultDateRange } from '@core/utils/util';

@Component({
  selector: 'app-reports',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    ButtonComponent,
    ClickTrackingDirective,
    InputFieldComponent,
    ClientSelectFieldComponent,
    DecimalPipe,
    ControlErrorModule,
    DataTableComponent,
    TableColumnDirective,
    IconComponent,
  ],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsComponent {
  private readonly reportService = inject(ReportService);
  private readonly fb = inject(FormBuilder);

  readonly pageSize = 10;
  readonly loading = signal(false);
  readonly downloading = signal(false);

  private readonly defaultRange = defaultDateRange();

  readonly form: FormType<ReportFilterForm> = this.fb.nonNullable.group({
    fechaInicio: [this.defaultRange.start, [Validators.required]],
    fechaFin: [this.defaultRange.end, [Validators.required]],
    cliente: [''],
    todosClientes: [false],
  });

  readonly committedParams = signal<Omit<ReportParams, 'page' | 'size'> | null>(
    {
      fechaInicio: this.defaultRange.start,
      fechaFin: this.defaultRange.end,
      cliente: undefined,
    },
  );

  readonly page = linkedSignal(() => (this.committedParams(), 1));

  private readonly loadTrigger = computed(() => ({
    params: this.committedParams(),
    page: this.page(),
  }));

  readonly rows = signal<ReportRow[] | null>(null);
  readonly totalElements = signal(0);

  protected readonly displayRows = computed(() => this.rows() ?? []);
  protected readonly emptyMessage = computed(() =>
    this.rows() === null ? 'Cargando...' : 'Sin resultados',
  );

  constructor() {
    toObservable(this.loadTrigger)
      .pipe(
        filter(({ params }) => params !== null),
        tap(() => this.loading.set(true)),
        switchMap(({ params, page }) =>
          this.reportService
            .getReport({ ...params!, page, size: this.pageSize })
            .pipe(
              catchError(() => of(null as PagedResponse<ReportRow> | null)),
            ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((resp) => {
        if (resp === null) {
          this.rows.set([]);
          this.totalElements.set(0);
        } else {
          this.rows.set(resp.content);
          this.totalElements.set(resp.totalElements);
        }
        this.loading.set(false);
      });

    this.form.controls.todosClientes.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((all) => {
        if (all) {
          this.form.controls.cliente.disable();
          this.form.controls.cliente.reset('');
        } else {
          this.form.controls.cliente.enable();
        }
      });
  }

  search(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { fechaInicio, fechaFin, cliente, todosClientes } =
      this.form.getRawValue();
    this.committedParams.set({
      fechaInicio,
      fechaFin,
      cliente: todosClientes ? undefined : cliente || undefined,
    });
  }

  downloadPdf(): void {
    const params = this.committedParams();
    if (params === null) return;
    this.downloading.set(true);

    this.reportService
      .getReportPdf(params)
      .pipe(finalize(() => this.downloading.set(false)))
      .subscribe();
  }
}
