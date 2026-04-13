import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { MovementsComponent } from './movements.component';
import { MovementService } from '@core/services/movement.service';
import { ToastService } from '@shared/ui/toast/toast.service';
import { MovementResponse, PagedResponse } from '@core/interface';
import { expectContainedText } from '@app/spec-helpers/element.spec-helper';
import { ANALYTICS_ADAPTER } from '@core/services/analytics.service';

const mockMovement: MovementResponse = {
  id: 1,
  fecha: '2024-01-15T00:00:00',
  tipoMovimiento: 'CREDITO',
  valor: 500,
  saldo: 1500,
  numeroCuenta: '478758',
};

const mockPaged: PagedResponse<MovementResponse> = {
  content: [mockMovement],
  page: 1,
  size: 10,
  totalElements: 1,
  totalPages: 1,
  first: true,
  last: true,
};

describe('MovementsComponent', () => {
  let fixture: ComponentFixture<MovementsComponent>;
  let component: MovementsComponent;

  const movementServiceSpy = {
    getAll: jest.fn(),
    delete: jest.fn(),
  };
  const toastSpy = { success: jest.fn(), error: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    movementServiceSpy.getAll.mockReturnValue(of(mockPaged));
    movementServiceSpy.delete.mockReturnValue(of(null));

    await TestBed.configureTestingModule({
      imports: [MovementsComponent],
      providers: [
        provideRouter([]),
        { provide: MovementService, useValue: movementServiceSpy },
        { provide: ToastService, useValue: toastSpy },
        {
          provide: ANALYTICS_ADAPTER,
          useValue: { trackEvent: jest.fn(), trackPageView: jest.fn() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MovementsComponent);
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
    expectContainedText(fixture, 'Movimientos');
  });

  it('should call getAll on init with page 1 and correct page size', () => {
    expect(movementServiceSpy.getAll).toHaveBeenCalledWith({
      page: 1,
      size: component.pageSize,
    });
  });

  it('should expose loaded movements via filteredRows', () => {
    expect(component.filteredRows()).toHaveLength(1);
    expect(component.filteredRows()[0].numeroCuenta).toBe('478758');
  });

  it('should reflect totalElements from the paged response', () => {
    expect(component.totalElements()).toBe(1);
  });

  it('should call delete on the service and reload after onDelete', async () => {
    component.onDelete(mockMovement);
    await fixture.whenStable();
    await new Promise((r) => setTimeout(r, 0));
    await fixture.whenStable();

    expect(movementServiceSpy.delete).toHaveBeenCalledWith(1);
    expect(toastSpy.success).toHaveBeenCalled();
    expect(movementServiceSpy.getAll).toHaveBeenCalledTimes(2);
  });
});
