import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  Router,
} from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';
import { ClientEditComponent } from './client-edit.component';
import { ClientService } from '@core/services/client/client.service';
import { ToastService } from '@shared/ui/toast/toast.service';
import { ClientResponse } from '@core/interface';
import { AnalyticsAdapter } from '@core/services/analytics/analytics.adapter';

@Component({ template: '<p>Lista</p>' })
class FakeListComponent {}

const mockClient: ClientResponse = {
  clienteId: '99',
  nombre: 'María Díaz',
  genero: 'FEMENINO',
  edad: 28,
  identificacion: '9876543210',
  direccion: 'Quito',
  telefono: '099000000',
  estado: true,
};

describe('ClientEditComponent', () => {
  const clientServiceSpy = {
    getById: jest.fn(),
    update: jest.fn(),
    patch: jest.fn(),
  };
  const toastSpy = { success: jest.fn() };

  let harness: RouterTestingHarness;

  beforeEach(async () => {
    jest.clearAllMocks();
    clientServiceSpy.getById.mockReturnValue(of(mockClient));
    clientServiceSpy.update.mockReturnValue(of(mockClient));
    clientServiceSpy.patch.mockReturnValue(of(mockClient));

    await TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [
            { path: 'clientes', component: FakeListComponent },
            { path: 'clientes/:id/editar', component: ClientEditComponent },
          ],
          withComponentInputBinding(),
        ),
        { provide: ClientService, useValue: clientServiceSpy },
        { provide: ToastService, useValue: toastSpy },
        {
          provide: AnalyticsAdapter,
          useValue: { trackEvent: jest.fn(), trackPageView: jest.fn() },
        },
      ],
    }).compileComponents();

    harness = await RouterTestingHarness.create();
  });

  it('should create the component when navigating to the edit route', async () => {
    const component = await harness.navigateByUrl(
      '/clientes/99/editar',
      ClientEditComponent,
    );
    await harness.fixture.whenStable();
    expect(component).toBeTruthy();
  });

  it('should bind the route :id param to the id input', async () => {
    const component = await harness.navigateByUrl(
      '/clientes/99/editar',
      ClientEditComponent,
    );
    await harness.fixture.whenStable();
    expect(component.id()).toBe('99');
  });

  it('should call getById with the route param id', async () => {
    await harness.navigateByUrl('/clientes/99/editar', ClientEditComponent);
    await harness.fixture.whenStable();
    expect(clientServiceSpy.getById).toHaveBeenCalledWith('99');
  });

  it('should populate the form control with the loaded client data', async () => {
    await harness.navigateByUrl('/clientes/99/editar', ClientEditComponent);
    await harness.fixture.whenStable();

    const component = harness.routeDebugElement!
      .componentInstance as ClientEditComponent;
    expect(component.editClientForm.value).toMatchObject({
      nombre: 'María Díaz',
    });
  });

  it('should call update service and navigate back on valid submit', async () => {
    const component = await harness.navigateByUrl(
      '/clientes/99/editar',
      ClientEditComponent,
    );
    await harness.fixture.whenStable();

    component.editClientForm.setValue(mockClient as never);
    component.onSubmit();
    await harness.fixture.whenStable();

    expect(clientServiceSpy.patch).toHaveBeenCalledWith(
      '99',
      expect.objectContaining({ nombre: 'María Díaz' }),
    );
    expect(toastSpy.success).toHaveBeenCalled();
    expect(TestBed.inject(Router).url).toBe('/clientes');
  });

  it('should not call update when the form is invalid', async () => {
    const component = await harness.navigateByUrl(
      '/clientes/99/editar',
      ClientEditComponent,
    );

    component.editClientForm.setValue(null);
    component.onSubmit();
    await harness.fixture.whenStable();

    expect(clientServiceSpy.patch).not.toHaveBeenCalled();
  });
});
