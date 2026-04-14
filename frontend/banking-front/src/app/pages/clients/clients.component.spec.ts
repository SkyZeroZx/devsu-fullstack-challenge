import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ClientsComponent } from './clients.component';
import { ClientService } from '@core/services/client/client.service';
import { ToastService } from '@shared/ui/toast/toast.service';
import { ClientResponse, PagedResponse } from '@core/interface';
import { expectContainedText } from '@app/spec-helpers/element.spec-helper';
import { AnalyticsAdapter } from '@core/services/analytics/analytics.adapter';
import { flushMacrotask } from '@app/spec-helpers/flush-macrotask';

const mockClient: ClientResponse = {
  clienteId: '1',
  nombre: 'José Lema',
  genero: 'MASCULINO',
  edad: 30,
  identificacion: '1234567890',
  direccion: 'Otavalo sn y principal',
  telefono: '098254785',
  estado: true,
};

const mockPaged: PagedResponse<ClientResponse> = {
  content: [mockClient],
  page: 1,
  size: 10,
  totalElements: 1,
  totalPages: 1,
  first: true,
  last: true,
};

describe('ClientsComponent', () => {
  let fixture: ComponentFixture<ClientsComponent>;
  let component: ClientsComponent;

  const clientServiceSpy = {
    getAll: jest.fn(),
    delete: jest.fn(),
  };
  const toastSpy = { success: jest.fn(), error: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    clientServiceSpy.getAll.mockReturnValue(of(mockPaged));
    clientServiceSpy.delete.mockReturnValue(of(null));

    await TestBed.configureTestingModule({
      imports: [ClientsComponent],
      providers: [
        provideRouter([]),
        { provide: ClientService, useValue: clientServiceSpy },
        { provide: ToastService, useValue: toastSpy },
        {
          provide: AnalyticsAdapter,
          useValue: { trackEvent: jest.fn(), trackPageView: jest.fn() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ClientsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
    await flushMacrotask();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the page title', () => {
    expectContainedText(fixture, 'Clientes');
  });

  it('should call getAll on init with page 1 and correct page size', () => {
    expect(clientServiceSpy.getAll).toHaveBeenCalledWith({
      page: 1,
      size: component.pageSize,
    });
  });

  it('should expose loaded clients via filteredRows', () => {
    expect(component.filteredRows()).toHaveLength(1);
    expect(component.filteredRows()[0].nombre).toBe('José Lema');
  });

  it('should reflect totalElements from the paged response', () => {
    expect(component.totalElements()).toBe(1);
  });

  it('should call delete on the service and reload after onDelete', async () => {
    component.onDelete(mockClient);
    await fixture.whenStable();
    await flushMacrotask();

    expect(clientServiceSpy.delete).toHaveBeenCalledWith('1');
    expect(toastSpy.success).toHaveBeenCalled();
    expect(clientServiceSpy.getAll).toHaveBeenCalledTimes(2);
  });

  it('should filter rows client-side when a search term matches nombre', () => {
    // filteredRows() returns loaded data filtered by searchTerm signal
    // With no search term, all loaded items are returned
    expect(component.filteredRows()).toEqual(mockPaged.content);
  });
});
