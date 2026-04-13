import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ClientCreateComponent } from './client-create.component';
import { ClientService } from '@core/services/client/client.service';
import { ToastService } from '@shared/ui/toast/toast.service';
import { ClientRequest, ClientResponse } from '@core/interface';
import { expectContainedText } from '@app/spec-helpers/element.spec-helper';
import { AnalyticsAdapter } from '@core/services/analytics/analytics.adapter';

const mockCreated: ClientResponse = {
  clienteId: '1',
  nombre: 'José Lema',
  genero: 'MASCULINO',
  edad: 30,
  identificacion: '1234567890',
  direccion: 'Otavalo sn y principal',
  telefono: '098254785',
  estado: true,
};

describe('ClientCreateComponent', () => {
  let fixture: ComponentFixture<ClientCreateComponent>;
  let component: ClientCreateComponent;

  const clientServiceSpy = { create: jest.fn() };
  const toastSpy = { success: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    clientServiceSpy.create.mockReturnValue(of(mockCreated));

    await TestBed.configureTestingModule({
      imports: [ClientCreateComponent],
      providers: [
        provideRouter([{ path: 'clientes', redirectTo: '' }]),
        { provide: ClientService, useValue: clientServiceSpy },
        { provide: ToastService, useValue: toastSpy },
        {
          provide: AnalyticsAdapter,
          useValue: { trackEvent: jest.fn(), trackPageView: jest.fn() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ClientCreateComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the page title', () => {
    expectContainedText(fixture, 'Nuevo Cliente');
  });

  it('should not call service when form is invalid on submit', async () => {
    component.onSubmit();
    await fixture.whenStable();

    expect(clientServiceSpy.create).not.toHaveBeenCalled();
  });

  it('should call create service when the form is valid', async () => {
    const request: ClientRequest = {
      nombre: 'José Lema',
      genero: 'MASCULINO',
      edad: 30,
      identificacion: '1234567890',
      direccion: 'Otavalo sn y principal',
      telefono: '098254785',
      contrasena: 'secret',
      estado: true,
    };
    component.formCtrl.setValue(request as never);

    component.onSubmit();
    await fixture.whenStable();

    expect(clientServiceSpy.create).toHaveBeenCalledWith(request);
    expect(toastSpy.success).toHaveBeenCalled();
  });
});
