import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ReportService } from '@core/services/report/report.service';
import { FormType, ReportFilterForm, ReportRow } from '@core/interface';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { ClickTrackingDirective } from '@shared/directives/click-tracking/click-tracking.directive';
import { InputFieldComponent } from '@shared/ui/form-field/input-field/input-field.component';
import { ClientSelectFieldComponent } from '@shared/ui/form-field/client-select-field/client-select-field.component';
import { DecimalPipe } from '@angular/common';
import { ControlErrorModule } from '@app/shared/ui/control-error/control-error.module';
import { DataTableComponent } from '@shared/ui/data-table/data-table.component';
import { TableColumnDirective } from '@shared/ui/data-table/table-column.directive';
import { IconComponent } from '@shared/ui/icon/icon.component';

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
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(false);
  readonly downloading = signal(false);
  readonly rows = signal<ReportRow[] | null>(null);

  protected readonly displayRows = computed(() => this.rows() ?? []);
  protected readonly emptyMessage = computed(() =>
    this.rows() === null
      ? 'Seleccione un rango de fechas y presione Buscar'
      : 'Sin resultados',
  );

  readonly form: FormType<ReportFilterForm> = this.fb.nonNullable.group({
    fechaInicio: ['', [Validators.required]],
    fechaFin: ['', [Validators.required]],
    cliente: [''],
  });

  search(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);

    const { fechaInicio, fechaFin, cliente } = this.form.getRawValue();
    this.reportService
      .getReport({ fechaInicio, fechaFin, cliente: cliente || undefined })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.rows.set(data);
          this.loading.set(false);
        },
        error: () => {
          this.rows.set([]);
          this.loading.set(false);
        },
      });
  }

  downloadPdf(): void {
    if (this.form.invalid) return;
    this.downloading.set(true);

    const { fechaInicio, fechaFin, cliente } = this.form.getRawValue();
    this.reportService
      .getReportPdf({ fechaInicio, fechaFin, cliente: cliente || undefined })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const link = document.createElement('a');
          link.href = `data:application/pdf;base64,${res.reporte}`;
          link.download = 'reporte.pdf';
          link.click();
          this.downloading.set(false);
        },
        error: () => this.downloading.set(false),
      });
  }
}
