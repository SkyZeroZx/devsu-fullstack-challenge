import { TestBed } from '@angular/core/testing';
import {
  provideRouter,
  withComponentInputBinding,
  Router,
} from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';
import { AccountEditComponent } from './account-edit.component';
import { AccountService } from '@core/services/account/account.service';
import { ClientService } from '@core/services/client/client.service';
import { ToastService } from '@shared/ui/toast/toast.service';
import { AccountResponse } from '@core/interface';
import { Component } from '@angular/core';
import { AnalyticsAdapter } from '@core/services/analytics/analytics.adapter';

@Component({ template: '<p>Lista</p>' })
class FakeListComponent {}

const mockAccount: AccountResponse = {
  numeroCuenta: '478758',
  tipoCuenta: 'AHORRO',
  saldoInicial: 2000,
  estado: true,
  clienteId: 'c1',
  cliente: 'José Lema',
};

describe('AccountEditComponent', () => {
  const accountServiceSpy = {
    getById: jest.fn(),
    update: jest.fn(),
  };
  const clientServiceSpy = {
    getAll: jest.fn().mockReturnValue(
      of({
        content: [],
        page: 1,
        size: 200,
        totalElements: 0,
        totalPages: 0,
        first: true,
        last: true,
      }),
    ),
  };
  const toastSpy = { success: jest.fn() };

  let harness: RouterTestingHarness;

  beforeEach(async () => {
    jest.clearAllMocks();
    accountServiceSpy.getById.mockReturnValue(of(mockAccount));
    accountServiceSpy.update.mockReturnValue(of(mockAccount));

    await TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [
            { path: 'cuentas', component: FakeListComponent },
            { path: 'cuentas/:id/editar', component: AccountEditComponent },
          ],
          withComponentInputBinding(),
        ),
        { provide: AccountService, useValue: accountServiceSpy },
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
      '/cuentas/478758/editar',
      AccountEditComponent,
    );
    await harness.fixture.whenStable();
    expect(component).toBeTruthy();
  });

  it('should bind the route :id param to the id input', async () => {
    const component = await harness.navigateByUrl(
      '/cuentas/478758/editar',
      AccountEditComponent,
    );
    await harness.fixture.whenStable();
    expect(component.id()).toBe('478758');
  });

  it('should call getById with the route param id', async () => {
    await harness.navigateByUrl('/cuentas/478758/editar', AccountEditComponent);
    await harness.fixture.whenStable();
    expect(accountServiceSpy.getById).toHaveBeenCalledWith('478758');
  });

  it('should populate the form control with the loaded account data', async () => {
    await harness.navigateByUrl('/cuentas/478758/editar', AccountEditComponent);

    // Wait for the effect that sets the form value
    await harness.fixture.whenStable();

    const component = harness.routeDebugElement!
      .componentInstance as AccountEditComponent;
    expect(component.editAccountForm.value).toMatchObject({
      numeroCuenta: '478758',
    });
  });

  it('should call update service and navigate back on valid submit', async () => {
    const component = await harness.navigateByUrl(
      '/cuentas/478758/editar',
      AccountEditComponent,
    );
    await harness.fixture.whenStable();

    component.editAccountForm.setValue(mockAccount as never);
    component.onSubmit();
    await harness.fixture.whenStable();

    expect(accountServiceSpy.update).toHaveBeenCalledWith('478758', {
      numeroCuenta: '478758',
      tipoCuenta: 'AHORRO',
      saldoInicial: 2000,
      estado: true,
      clienteId: 'c1',
    });
    expect(toastSpy.success).toHaveBeenCalled();
    expect(TestBed.inject(Router).url).toBe('/cuentas');
  });

  it('should not call update when the form is invalid', async () => {
    const component = await harness.navigateByUrl(
      '/cuentas/478758/editar',
      AccountEditComponent,
    );

    component.editAccountForm.setErrors({ invalidForm: { valid: false } });
    component.onSubmit();
    await harness.fixture.whenStable();

    expect(accountServiceSpy.update).not.toHaveBeenCalled();
  });
});
