import { TestBed, ComponentFixture } from '@angular/core/testing';
import { of } from 'rxjs';
import { ReportsComponent } from './reports.component';
import { ReportService } from '@core/services/report/report.service';
import { ClientService } from '@core/services/client/client.service';
import { PagedResponse, ReportRow, ClientResponse } from '@core/interface';
import { expectContainedText } from '@app/spec-helpers/element.spec-helper';
import { AnalyticsAdapter } from '@core/services/analytics/analytics.adapter';
import { flushMacrotask } from '@app/spec-helpers/flush-macrotask';

const mockClients: PagedResponse<ClientResponse> = {
  content: [
    {
      clienteId: '1',
      nombre: 'José Lema',
      genero: 'MASCULINO',
      edad: 30,
      identificacion: '1234567890',
      direccion: 'Otavalo',
      telefono: '098254785',
      estado: true,
    },
  ],
  page: 1,
  size: 20,
  totalElements: 1,
  totalPages: 1,
  first: true,
  last: true,
};

const mockRows: ReportRow[] = [
  {
    fecha: '2024-01-15',
    cliente: 'José Lema',
    numeroCuenta: '478758',
    tipo: 'AHORRO',
    saldoInicial: 2000,
    estado: true,
    movimiento: 500,
    saldoDisponible: 2500,
  },
];

const mockPagedRows: PagedResponse<ReportRow> = {
  content: mockRows,
  page: 1,
  size: 10,
  totalElements: 1,
  totalPages: 1,
  first: true,
  last: true,
};

describe('ReportsComponent', () => {
  let fixture: ComponentFixture<ReportsComponent>;
  let component: ReportsComponent;

  const reportServiceSpy = {
    getReport: jest.fn(),
    getReportPdf: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    reportServiceSpy.getReport.mockReturnValue(of(mockPagedRows));
    reportServiceSpy.getReportPdf.mockReturnValue(of({ base64: 'abc123' }));

    await TestBed.configureTestingModule({
      imports: [ReportsComponent],
      providers: [
        { provide: ReportService, useValue: reportServiceSpy },
        {
          provide: ClientService,
          useValue: { getAll: jest.fn().mockReturnValue(of(mockClients)) },
        },
        {
          provide: AnalyticsAdapter,
          useValue: { trackEvent: jest.fn(), trackPageView: jest.fn() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the page title', () => {
    expectContainedText(fixture, 'Reportes');
  });

  it('should auto-load the report on init with the default 1-month date range', async () => {
    await flushMacrotask();
    await fixture.whenStable();

    expect(reportServiceSpy.getReport).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        size: component.pageSize,
        cliente: undefined,
      }),
    );
    const call = reportServiceSpy.getReport.mock.calls[0][0];
    expect(call.fechaInicio).toBeTruthy();
    expect(call.fechaFin).toBeTruthy();
    expect(component.rows()).toHaveLength(1);
  });

  it('should mark form as touched when search is called with empty dates', () => {
    reportServiceSpy.getReport.mockClear();
    component.form.reset();
    component.search();
    expect(component.form.touched).toBe(true);
    expect(reportServiceSpy.getReport).not.toHaveBeenCalled();
  });

  it('should call getReport with correct params and populate rows', async () => {
    component.form.setValue({
      fechaInicio: '2024-01-01',
      fechaFin: '2024-01-31',
      cliente: '',
      todosClientes: false,
    });
    component.search();
    TestBed.flushEffects();
    await flushMacrotask();
    await fixture.whenStable();

    expect(reportServiceSpy.getReport).toHaveBeenCalledWith({
      fechaInicio: '2024-01-01',
      fechaFin: '2024-01-31',
      cliente: undefined,
      page: 1,
      size: component.pageSize,
    });
    expect(component.rows()).toHaveLength(1);
    expect(component.loading()).toBe(false);
  });

  it('should pass the selected cliente when filtering by client', async () => {
    component.form.setValue({
      fechaInicio: '2024-01-01',
      fechaFin: '2024-01-31',
      cliente: 'José Lema',
      todosClientes: false,
    });
    component.search();
    TestBed.flushEffects();
    await flushMacrotask();
    await fixture.whenStable();

    expect(reportServiceSpy.getReport).toHaveBeenCalledWith({
      fechaInicio: '2024-01-01',
      fechaFin: '2024-01-31',
      cliente: 'José Lema',
      page: 1,
      size: component.pageSize,
    });
  });

  it('should send no cliente when todosClientes is checked', async () => {
    component.form.setValue({
      fechaInicio: '2024-01-01',
      fechaFin: '2024-01-31',
      cliente: 'José Lema',
      todosClientes: true,
    });
    component.search();
    TestBed.flushEffects();
    await flushMacrotask();
    await fixture.whenStable();

    expect(reportServiceSpy.getReport).toHaveBeenCalledWith({
      fechaInicio: '2024-01-01',
      fechaFin: '2024-01-31',
      cliente: undefined,
      page: 1,
      size: component.pageSize,
    });
  });

  it('should set rows to empty array when the report request fails', async () => {
    reportServiceSpy.getReport.mockReturnValue(
      new (require('rxjs').Observable)((sub: { error: (e: Error) => void }) =>
        sub.error(new Error('server error')),
      ),
    );
    component.form.setValue({
      fechaInicio: '2024-01-01',
      fechaFin: '2024-01-31',
      cliente: '',
      todosClientes: false,
    });
    component.search();
    await flushMacrotask();
    await fixture.whenStable();

    expect(component.rows()).toEqual([]);
    expect(component.loading()).toBe(false);
  });
});
