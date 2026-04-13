import { HttpClient, HttpParams } from '@angular/common/http';
import { DOCUMENT, inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import {
  PagedResponse,
  ReportParams,
  ReportPdfResponse,
  ReportRow,
} from '@core/interface';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly http = inject(HttpClient);
  private readonly document = inject(DOCUMENT);
  private readonly baseUrl = `${environment.API_URL}/api/reportes`;

  getReport(params: ReportParams) {
    let httpParams = new HttpParams()
      .set('fechaInicio', params.fechaInicio)
      .set('fechaFin', params.fechaFin);
    if (params.cliente) httpParams = httpParams.set('cliente', params.cliente);
    if (params.page != null) httpParams = httpParams.set('page', params.page);
    if (params.size != null) httpParams = httpParams.set('size', params.size);
    return this.http.get<PagedResponse<ReportRow>>(this.baseUrl, {
      params: httpParams,
    });
  }

  getReportPdf(params: ReportParams) {
    let httpParams = new HttpParams()
      .set('fechaInicio', params.fechaInicio)
      .set('fechaFin', params.fechaFin);
    if (params.cliente) httpParams = httpParams.set('cliente', params.cliente);
    return this.http
      .get<ReportPdfResponse>(`${this.baseUrl}/pdf`, {
        params: httpParams,
      })
      .pipe(tap((res) => this.downloadReportPdf(res)));
  }

  downloadReportPdf(res: ReportPdfResponse) {
    const link = this.document.createElement('a');
    link.href = `data:application/pdf;base64,${res.reporte}`;
    link.download = 'reporte.pdf';
    link.click();
    link.remove();
  }
}
