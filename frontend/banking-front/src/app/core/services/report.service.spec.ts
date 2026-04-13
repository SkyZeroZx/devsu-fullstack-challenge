import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ReportService } from './report.service';
import { ReportParams, ReportRow } from '@core/interface';

describe('ReportService', () => {
  let service: ReportService;
  let httpMock: HttpTestingController;

  const mockRows: ReportRow[] = [
    {
      fecha: '2024-01-15',
      cliente: 'Juan Perez',
      numeroCuenta: '123456',
      tipo: 'AHORRO',
      saldoInicial: 1000,
      estado: true,
      movimiento: 200,
      saldoDisponible: 1200,
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ReportService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  describe('getReport', () => {
    it('should GET /api/reportes with required date params', () => {
      const params: ReportParams = {
        fechaInicio: '2024-01-01',
        fechaFin: '2024-01-31',
      };

      service
        .getReport(params)
        .subscribe((rows) => expect(rows).toEqual(mockRows));

      const req = httpMock.expectOne(
        (r) =>
          r.url.includes('/api/reportes') &&
          r.params.get('fechaInicio') === '2024-01-01' &&
          r.params.get('fechaFin') === '2024-01-31',
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockRows);
    });

    it('should include cliente param when provided', () => {
      const params: ReportParams = {
        fechaInicio: '2024-01-01',
        fechaFin: '2024-01-31',
        cliente: 'Juan',
      };

      service.getReport(params).subscribe();

      const req = httpMock.expectOne(
        (r) =>
          r.url.includes('/api/reportes') && r.params.get('cliente') === 'Juan',
      );
      req.flush([]);
    });

    it('should omit cliente param when not provided', () => {
      const params: ReportParams = {
        fechaInicio: '2024-01-01',
        fechaFin: '2024-01-31',
      };

      service.getReport(params).subscribe();

      const req = httpMock.expectOne((r) => r.url.includes('/api/reportes'));
      expect(req.request.params.has('cliente')).toBe(false);
      req.flush([]);
    });

    it('should omit cliente param when cliente is undefined', () => {
      const params: ReportParams = {
        fechaInicio: '2024-01-01',
        fechaFin: '2024-01-31',
        cliente: undefined,
      };

      service.getReport(params).subscribe();

      const req = httpMock.expectOne((r) => r.url.includes('/api/reportes'));
      expect(req.request.params.has('cliente')).toBe(false);
      req.flush([]);
    });
  });

  describe('getReportPdf', () => {
    it('should GET /api/reportes/pdf with date params', () => {
      const params: ReportParams = {
        fechaInicio: '2024-01-01',
        fechaFin: '2024-01-31',
      };

      service
        .getReportPdf(params)
        .subscribe((res) => expect(res.base64).toBe('abc123'));

      const req = httpMock.expectOne(
        (r) =>
          r.url.includes('/api/reportes/pdf') &&
          r.params.get('fechaInicio') === '2024-01-01' &&
          r.params.get('fechaFin') === '2024-01-31',
      );
      expect(req.request.method).toBe('GET');
      req.flush({ base64: 'abc123' });
    });

    it('should include cliente param in PDF request when provided', () => {
      const params: ReportParams = {
        fechaInicio: '2024-01-01',
        fechaFin: '2024-01-31',
        cliente: 'María',
      };

      service.getReportPdf(params).subscribe();

      const req = httpMock.expectOne(
        (r) =>
          r.url.includes('/api/reportes/pdf') &&
          r.params.get('cliente') === 'María',
      );
      req.flush({ base64: 'xyz' });
    });
  });
});
