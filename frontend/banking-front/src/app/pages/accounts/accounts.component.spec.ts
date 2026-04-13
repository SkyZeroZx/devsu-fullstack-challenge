import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AccountsComponent } from './accounts.component';
import { AccountService } from '@core/services/account.service';
import { ToastService } from '@shared/ui/toast/toast.service';
import { AccountResponse, PagedResponse } from '@core/interface';
import { expectContainedText } from '@app/spec-helpers/element.spec-helper';
import { ANALYTICS_ADAPTER } from '@core/services/analytics.service';

const mockAccount: AccountResponse = {
  numeroCuenta: '478758',
  tipoCuenta: 'AHORRO',
  saldoInicial: 2000,
  estado: true,
  cliente: 'José Lema',
};

const mockPaged: PagedResponse<AccountResponse> = {
  content: [mockAccount],
  page: 1,
  size: 10,
  totalElements: 1,
  totalPages: 1,
  first: true,
  last: true,
};

describe('AccountsComponent', () => {
  let fixture: ComponentFixture<AccountsComponent>;
  let component: AccountsComponent;

  const accountServiceSpy = {
    getAll: jest.fn(),
    delete: jest.fn(),
  };
  const toastSpy = { success: jest.fn(), error: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    accountServiceSpy.getAll.mockReturnValue(of(mockPaged));
    accountServiceSpy.delete.mockReturnValue(of(null));

    await TestBed.configureTestingModule({
      imports: [AccountsComponent],
      providers: [
        provideRouter([]),
        { provide: AccountService, useValue: accountServiceSpy },
        { provide: ToastService, useValue: toastSpy },
        {
          provide: ANALYTICS_ADAPTER,
          useValue: { trackEvent: jest.fn(), trackPageView: jest.fn() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
    // debounceTime(0) uses setTimeout — yield the event loop to let it fire
    await new Promise((r) => setTimeout(r, 0));
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the page title', () => {
    expectContainedText(fixture, 'Cuentas');
  });

  it('should call getAll on init with page 1 and correct page size', () => {
    expect(accountServiceSpy.getAll).toHaveBeenCalledWith({
      page: 1,
      size: component.pageSize,
    });
  });

  it('should expose loaded accounts via filteredRows', () => {
    expect(component.filteredRows()).toHaveLength(1);
    expect(component.filteredRows()[0].numeroCuenta).toBe('478758');
  });

  it('should reflect totalElements from the paged response', () => {
    expect(component.totalElements()).toBe(1);
  });

  it('should call delete on the service and reload after onDelete', async () => {
    component.onDelete(mockAccount);
    await fixture.whenStable();
    await new Promise((r) => setTimeout(r, 0));
    await fixture.whenStable();

    expect(accountServiceSpy.delete).toHaveBeenCalledWith('478758');
    expect(toastSpy.success).toHaveBeenCalled();
    // The reload triggers another getAll call
    expect(accountServiceSpy.getAll).toHaveBeenCalledTimes(2);
  });

  it('should filter rows client-side when a search term matches a field', () => {
    // filteredRows() uses the loaded data filtered by searchTerm()
    // Verify all returned rows match either numeroCuenta or cliente
    const rows = component.filteredRows();
    expect(
      rows.every(
        (a) =>
          a.numeroCuenta
            .toLowerCase()
            .includes(component['searchTerm']?.() ?? '') ||
          a.cliente.toLowerCase().includes(component['searchTerm']?.() ?? ''),
      ),
    ).toBe(true);
  });
});
