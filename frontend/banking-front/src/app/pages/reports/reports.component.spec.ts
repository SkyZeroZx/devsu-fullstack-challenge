import { TestBed, ComponentFixture } from '@angular/core/testing';
import { of } from 'rxjs';
import { ReportsComponent } from './reports.component';
import { ReportService } from '@core/services/report.service';
import { ClientService } from '@core/services/client.service';
import { ReportRow, PagedResponse, ClientResponse } from '@core/interface';
import { expectContainedText } from '@app/spec-helpers/element.spec-helper';
import { ANALYTICS_ADAPTER } from '@core/services/analytics.service';

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
  size: 200,
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

describe('ReportsComponent', () => {
  let fixture: ComponentFixture<ReportsComponent>;
  let component: ReportsComponent;

  const reportServiceSpy = {
    getReport: jest.fn(),
    getReportPdf: jest.fn(),
  };
  const clientServiceSpy = { getAll: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    clientServiceSpy.getAll.mockReturnValue(of(mockClients));
    reportServiceSpy.getReport.mockReturnValue(of(mockRows));
    reportServiceSpy.getReportPdf.mockReturnValue(of({ base64: 'abc123' }));

    await TestBed.configureTestingModule({
      imports: [ReportsComponent],
      providers: [
        { provide: ReportService, useValue: reportServiceSpy },
        { provide: ClientService, useValue: clientServiceSpy },
        {
          provide: ANALYTICS_ADAPTER,
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

  it('should load clients for the dropdown on init', () => {
    expect(clientServiceSpy.getAll).toHaveBeenCalledWith({ size: 200 });
    expect(component.clients()?.content).toHaveLength(1);
  });

  it('should start with rows as null (no search performed yet)', () => {
    expect(component.rows()).toBeNull();
  });

  it('should mark form as touched when search is called with empty dates', () => {
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
    });
    component.search();
    await fixture.whenStable();

    expect(reportServiceSpy.getReport).toHaveBeenCalledWith({
      fechaInicio: '2024-01-01',
      fechaFin: '2024-01-31',
      cliente: undefined,
    });
    expect(component.rows()).toHaveLength(1);
    expect(component.loading()).toBe(false);
  });

  it('should pass the selected cliente when filtering by client', async () => {
    component.form.setValue({
      fechaInicio: '2024-01-01',
      fechaFin: '2024-01-31',
      cliente: 'José Lema',
    });
    component.search();
    await fixture.whenStable();

    expect(reportServiceSpy.getReport).toHaveBeenCalledWith({
      fechaInicio: '2024-01-01',
      fechaFin: '2024-01-31',
      cliente: 'José Lema',
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
    });
    component.search();
    await fixture.whenStable();

    expect(component.rows()).toEqual([]);
    expect(component.loading()).toBe(false);
  });
});
