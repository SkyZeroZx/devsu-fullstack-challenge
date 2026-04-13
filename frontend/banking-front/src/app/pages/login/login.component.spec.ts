import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthApiService } from '@core/services/auth-api.service';
import { AuthService } from '@core/services/auth.service';
import { expectContainedText } from '@app/spec-helpers/element.spec-helper';
import { ANALYTICS_ADAPTER } from '@core/services/analytics.service';

@Component({ template: '<p data-testid="home">Home</p>' })
class FakeHomeComponent {}

describe('LoginComponent', () => {
  let authApiStub: { login: jest.Mock };
  let authStub: { setToken: jest.Mock };
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    authApiStub = {
      login: jest
        .fn()
        .mockReturnValue(
          of({ token: 'test-token', username: 'admin', role: 'ADMIN' }),
        ),
    };
    authStub = { setToken: jest.fn() };

    await TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: '', component: FakeHomeComponent },
          { path: 'login', component: LoginComponent },
        ]),
        { provide: AuthApiService, useValue: authApiStub },
        { provide: AuthService, useValue: authStub },
        {
          provide: ANALYTICS_ADAPTER,
          useValue: { trackEvent: jest.fn(), trackPageView: jest.fn() },
        },
      ],
    }).compileComponents();

    harness = await RouterTestingHarness.create();
  });

  it('should create the component', async () => {
    const component = await harness.navigateByUrl('/login', LoginComponent);
    expect(component).toBeTruthy();
  });

  it('should render the page title', async () => {
    await harness.navigateByUrl('/login', LoginComponent);
    expectContainedText(harness.fixture, 'BANCO');
  });

  it('should render username and password inputs', async () => {
    await harness.navigateByUrl('/login', LoginComponent);
    const nativeEl = harness.routeNativeElement!;
    expect(nativeEl.querySelector('#username')).toBeTruthy();
    expect(nativeEl.querySelector('#password')).toBeTruthy();
  });

  it('should mark form as touched when submitted with empty fields', async () => {
    const component = await harness.navigateByUrl('/login', LoginComponent);

    component.onSubmit();
    await harness.fixture.whenStable();

    expect(component.form.touched).toBe(true);
    expect(authApiStub.login).not.toHaveBeenCalled();
  });

  it('should call authApi.login with form values on valid submit', async () => {
    const component = await harness.navigateByUrl('/login', LoginComponent);

    component.form.setValue({ username: 'admin', password: 'secret' });
    component.onSubmit();
    await harness.fixture.whenStable();

    expect(authApiStub.login).toHaveBeenCalledWith({
      username: 'admin',
      password: 'secret',
    });
  });

  it('should store the token and navigate to / after successful login', async () => {
    const component = await harness.navigateByUrl('/login', LoginComponent);

    component.form.setValue({ username: 'admin', password: 'secret' });
    component.onSubmit();
    await harness.fixture.whenStable();

    expect(authStub.setToken).toHaveBeenCalledWith('test-token');
    expect(TestBed.inject(Router).url).toBe('/');
  });

  it('should show an error message when login fails', async () => {
    authApiStub.login.mockReturnValue(
      throwError(() => new Error('Unauthorized')),
    );
    const component = await harness.navigateByUrl('/login', LoginComponent);

    component.form.setValue({ username: 'wrong', password: 'wrong' });
    component.onSubmit();
    await harness.fixture.whenStable();

    expect(component.error()).toBeTruthy();
    expect(component.loading()).toBe(false);
  });
});
