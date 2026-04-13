import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ReportService } from './report.service';
import { PagedResponse, ReportParams, ReportRow } from '@core/interface';

describe('ReportService', () => {
  let service: ReportService;
  let httpMock: HttpTestingController;

  const mockRow: ReportRow = {
    fecha: '2024-01-15',
    cliente: 'Juan Perez',
    numeroCuenta: '123456',
    tipo: 'AHORRO',
    saldoInicial: 1000,
    estado: true,
    movimiento: 200,
    saldoDisponible: 1200,
  };

  const mockPaged: PagedResponse<ReportRow> = {
    content: [mockRow],
    page: 1,
    size: 20,
    totalElements: 1,
    totalPages: 1,
    first: true,
    last: true,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ReportService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  describe('getReport', () => {
    it('should GET /api/reportes with required date params and return paged response', () => {
      const params: ReportParams = {
        fechaInicio: '2024-01-01',
        fechaFin: '2024-01-31',
      };

      service
        .getReport(params)
        .subscribe((paged) => expect(paged).toEqual(mockPaged));

      const req = httpMock.expectOne(
        (r) =>
          r.url.includes('/api/reportes') &&
          r.params.get('fechaInicio') === '2024-01-01' &&
          r.params.get('fechaFin') === '2024-01-31',
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockPaged);
    });

    it('should send page and size params when provided', () => {
      const params: ReportParams = {
        fechaInicio: '2024-01-01',
        fechaFin: '2024-01-31',
        page: 0,
        size: 10,
      };

      service.getReport(params).subscribe();

      const req = httpMock.expectOne(
        (r) =>
          r.url.includes('/api/reportes') &&
          r.params.get('page') === '0' &&
          r.params.get('size') === '10',
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockPaged);
    });

    it('should include cliente param when provided', () => {
      const params: ReportParams = {
        fechaInicio: '2024-01-01',
        fechaFin: '2024-01-31',
        cliente: 'abc123',
      };

      service.getReport(params).subscribe();

      const req = httpMock.expectOne(
        (r) =>
          r.url.includes('/api/reportes') &&
          r.params.get('cliente') === 'abc123',
      );
      req.flush(mockPaged);
    });

    it('should omit cliente param when not provided', () => {
      const params: ReportParams = {
        fechaInicio: '2024-01-01',
        fechaFin: '2024-01-31',
      };

      service.getReport(params).subscribe();

      const req = httpMock.expectOne((r) => r.url.includes('/api/reportes'));
      expect(req.request.params.has('cliente')).toBe(false);
      req.flush(mockPaged);
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
      req.flush(mockPaged);
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
        .subscribe((res) => expect(res.reporte).toBe('abc123'));

      const req = httpMock.expectOne(
        (r) =>
          r.url.includes('/api/reportes/pdf') &&
          r.params.get('fechaInicio') === '2024-01-01' &&
          r.params.get('fechaFin') === '2024-01-31',
      );
      expect(req.request.method).toBe('GET');
      req.flush({ reporte: 'abc123' });
    });

    it('should include cliente param in PDF request when provided', () => {
      const params: ReportParams = {
        fechaInicio: '2024-01-01',
        fechaFin: '2024-01-31',
        cliente: 'abc123',
      };

      service.getReportPdf(params).subscribe();

      const req = httpMock.expectOne(
        (r) =>
          r.url.includes('/api/reportes/pdf') &&
          r.params.get('cliente') === 'abc123',
      );
      req.flush({ reporte: 'xyz' });
    });

    it('should omit cliente param in PDF request when not provided', () => {
      const params: ReportParams = {
        fechaInicio: '2024-01-01',
        fechaFin: '2024-01-31',
      };

      service.getReportPdf(params).subscribe();

      const req = httpMock.expectOne((r) =>
        r.url.includes('/api/reportes/pdf'),
      );
      expect(req.request.params.has('cliente')).toBe(false);
      req.flush({ reporte: 'xyz' });
    });
  });
});

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
