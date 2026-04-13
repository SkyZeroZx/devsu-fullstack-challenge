import { TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { authGuard, publicGuard } from './auth.guard';
import { AuthService } from '@core/services/auth/auth.service';

@Component({ template: '<p>Dashboard</p>' })
class FakeDashboardComponent {}

@Component({ template: '<p>Login</p>' })
class FakeLoginComponent {}

describe('authGuard', () => {
  const isAuthenticatedSignal = signal(false);
  const authStub = { isAuthenticated: isAuthenticatedSignal.asReadonly() };

  beforeEach(async () => {
    isAuthenticatedSignal.set(false);
    await TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'login', component: FakeLoginComponent },
          {
            path: 'dashboard',
            component: FakeDashboardComponent,
            canActivate: [authGuard],
          },
        ]),
        { provide: AuthService, useValue: authStub },
      ],
    }).compileComponents();
  });

  it('allows navigation when the user is authenticated', async () => {
    isAuthenticatedSignal.set(true);
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/dashboard');

    expect(TestBed.inject(Router).url).toBe('/dashboard');
  });

  it('redirects to /login when the user is not authenticated', async () => {
    isAuthenticatedSignal.set(false);
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/dashboard');

    expect(TestBed.inject(Router).url).toBe('/login');
  });
});

describe('publicGuard', () => {
  const isAuthenticatedSignal = signal(false);
  const authStub = { isAuthenticated: isAuthenticatedSignal.asReadonly() };

  beforeEach(async () => {
    isAuthenticatedSignal.set(false);
    await TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: '', component: FakeDashboardComponent },
          {
            path: 'login',
            component: FakeLoginComponent,
            canActivate: [publicGuard],
          },
        ]),
        { provide: AuthService, useValue: authStub },
      ],
    }).compileComponents();
  });

  it('allows access to the login page when the user is not authenticated', async () => {
    isAuthenticatedSignal.set(false);
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/login');

    expect(TestBed.inject(Router).url).toBe('/login');
  });

  it('redirects to / when the user is already authenticated', async () => {
    isAuthenticatedSignal.set(true);
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/login');

    expect(TestBed.inject(Router).url).toBe('/');
  });
});
