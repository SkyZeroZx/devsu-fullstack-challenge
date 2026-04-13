import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AccountCreateComponent } from './account-create.component';
import { AccountService } from '@core/services/account/account.service';
import { ToastService } from '@shared/ui/toast/toast.service';
import { AccountRequest, AccountResponse } from '@core/interface';
import { expectContainedText } from '@app/spec-helpers/element.spec-helper';
import { AnalyticsAdapter } from '@core/services/analytics/analytics.adapter';

const mockCreated: AccountResponse = {
  numeroCuenta: '478758',
  tipoCuenta: 'AHORRO',
  saldoInicial: 2000,
  estado: true,
  cliente: 'José Lema',
};

describe('AccountCreateComponent', () => {
  let fixture: ComponentFixture<AccountCreateComponent>;
  let component: AccountCreateComponent;

  const accountServiceSpy = { create: jest.fn() };
  const toastSpy = { success: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    accountServiceSpy.create.mockReturnValue(of(mockCreated));

    await TestBed.configureTestingModule({
      imports: [AccountCreateComponent],
      providers: [
        provideRouter([{ path: 'cuentas', redirectTo: '' }]),
        { provide: AccountService, useValue: accountServiceSpy },
        { provide: ToastService, useValue: toastSpy },
        {
          provide: AnalyticsAdapter,
          useValue: { trackEvent: jest.fn(), trackPageView: jest.fn() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountCreateComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the page title', () => {
    expectContainedText(fixture, 'Nueva Cuenta');
  });

  it('should not call service when form is invalid on submit', async () => {
    component.onSubmit();
    await fixture.whenStable();

    expect(accountServiceSpy.create).not.toHaveBeenCalled();
  });

  it('should call create service when form is valid', async () => {
    const request: AccountRequest = {
      numeroCuenta: '478758',
      tipoCuenta: 'AHORRO',
      saldoInicial: 2000,
      estado: true,
      clienteId: '1',
    };
    component.createAccountForm.setValue(request as never);

    component.onSubmit();
    await fixture.whenStable();

    expect(accountServiceSpy.create).toHaveBeenCalledWith(request);
    expect(toastSpy.success).toHaveBeenCalled();
  });

  it('should reset saving state after creation error', async () => {
    accountServiceSpy.create.mockReturnValue(
      new (require('rxjs').Observable)((sub: { error: (e: Error) => void }) =>
        sub.error(new Error('server error')),
      ),
    );
    component.createAccountForm.setValue({ numeroCuenta: '1' } as never);

    component.onSubmit();
    await fixture.whenStable();

    expect(component.saving()).toBe(false);
  });
});
