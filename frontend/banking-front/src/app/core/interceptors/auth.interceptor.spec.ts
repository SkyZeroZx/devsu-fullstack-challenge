import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '@core/services/auth.service';
import { signal } from '@angular/core';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  const tokenSignal = signal<string | null>(null);
  const authStub = { token: tokenSignal.asReadonly() };

  beforeEach(() => {
    tokenSignal.set(null);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authStub },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('does not set Authorization header when there is no token', () => {
    http.get('/api/clientes').subscribe();
    const req = httpTesting.expectOne('/api/clientes');

    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush([]);
  });

  it('adds Bearer Authorization header when a token is available', () => {
    tokenSignal.set('my-jwt-token');

    http.get('/api/clientes').subscribe();
    const req = httpTesting.expectOne('/api/clientes');

    expect(req.request.headers.get('Authorization')).toBe(
      'Bearer my-jwt-token',
    );
    req.flush([]);
  });

  it('does not mutate the original request object', () => {
    tokenSignal.set('abc');
    const original = { url: '/api/clientes' };

    http.get(original.url).subscribe();
    const req = httpTesting.expectOne(original.url);

    expect(req.request.url).toBe('/api/clientes');
    req.flush([]);
  });
});
