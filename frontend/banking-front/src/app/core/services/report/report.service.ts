import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { ReportParams, ReportPdfResponse, ReportRow } from '@core/interface';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.API_URL}/api/reportes`;

  getReport(params: ReportParams) {
    let httpParams = new HttpParams()
      .set('fechaInicio', params.fechaInicio)
      .set('fechaFin', params.fechaFin);
    if (params.cliente) httpParams = httpParams.set('cliente', params.cliente);
    return this.http.get<ReportRow[]>(this.baseUrl, { params: httpParams });
  }

  getReportPdf(params: ReportParams) {
    let httpParams = new HttpParams()
      .set('fechaInicio', params.fechaInicio)
      .set('fechaFin', params.fechaFin);
    if (params.cliente) httpParams = httpParams.set('cliente', params.cliente);
    return this.http.get<ReportPdfResponse>(`${this.baseUrl}/pdf`, {
      params: httpParams,
    });
  }
}
