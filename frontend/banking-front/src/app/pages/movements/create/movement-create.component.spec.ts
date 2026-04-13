import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { MovementCreateComponent } from './movement-create.component';
import { MovementService } from '@core/services/movement.service';
import { ToastService } from '@shared/ui/toast/toast.service';
import { MovementRequest, MovementResponse } from '@core/interface';
import { expectContainedText } from '@app/spec-helpers/element.spec-helper';
import { ANALYTICS_ADAPTER } from '@core/services/analytics.service';

const mockCreated: MovementResponse = {
  id: 1,
  fecha: '2024-01-15T00:00:00',
  tipoMovimiento: 'CREDITO',
  valor: 500,
  saldo: 1500,
  numeroCuenta: '478758',
};

describe('MovementCreateComponent', () => {
  let fixture: ComponentFixture<MovementCreateComponent>;
  let component: MovementCreateComponent;

  const movementServiceSpy = { create: jest.fn() };
  const toastSpy = { success: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    movementServiceSpy.create.mockReturnValue(of(mockCreated));

    await TestBed.configureTestingModule({
      imports: [MovementCreateComponent],
      providers: [
        provideRouter([{ path: 'movimientos', redirectTo: '' }]),
        { provide: MovementService, useValue: movementServiceSpy },
        { provide: ToastService, useValue: toastSpy },
        {
          provide: ANALYTICS_ADAPTER,
          useValue: { trackEvent: jest.fn(), trackPageView: jest.fn() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MovementCreateComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the page title', () => {
    expectContainedText(fixture, 'Nuevo Movimiento');
  });

  it('should not call service when form is invalid on submit', async () => {
    component.onSubmit();
    await fixture.whenStable();

    expect(movementServiceSpy.create).not.toHaveBeenCalled();
  });

  it('should call create service when the form is valid', async () => {
    const request: MovementRequest = {
      numeroCuenta: '478758',
      tipoMovimiento: 'CREDITO',
      valor: 500,
    };
    component.formCtrl.setValue(request as never);

    component.onSubmit();
    await fixture.whenStable();

    expect(movementServiceSpy.create).toHaveBeenCalledWith(request);
    expect(toastSpy.success).toHaveBeenCalled();
  });
});
