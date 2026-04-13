import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { catchError, of } from 'rxjs';
import { ReportService } from '@core/services/report.service';
import { ClientService } from '@core/services/client.service';
import { ReportRow } from '@core/interface';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { ClickTrackingDirective } from '@shared/directives/click-tracking/click-tracking.directive';
import { SkeletonComponent } from '@shared/ui/skeleton/skeleton.component';
import { InputFieldComponent } from '@shared/ui/form-field/input-field.component';
import { SelectFieldComponent } from '@shared/ui/form-field/select-field.component';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-reports',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    ButtonComponent,
    ClickTrackingDirective,
    SkeletonComponent,
    InputFieldComponent,
    SelectFieldComponent,
    DecimalPipe,
  ],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsComponent {
  private readonly reportService = inject(ReportService);
  private readonly clientService = inject(ClientService);

  readonly loading = signal(false);
  readonly downloading = signal(false);
  readonly rows = signal<ReportRow[] | null>(null);

  readonly clients = toSignal(
    this.clientService.getAll({ size: 10 }).pipe(catchError(() => of(null))),
    { initialValue: null },
  );

  readonly clientOptions = computed(() =>
    (this.clients()?.content ?? []).map((c) => ({
      value: c.clienteId,
      label: c.nombre,
    })),
  );

  readonly form = new FormGroup({
    fechaInicio: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    fechaFin: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    cliente: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
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
