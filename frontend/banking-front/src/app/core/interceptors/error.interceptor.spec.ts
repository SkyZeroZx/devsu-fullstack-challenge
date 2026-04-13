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
import { provideRouter, Router } from '@angular/router';
import { errorInterceptor } from './error.interceptor';
import { AuthService } from '@core/services/auth/auth.service';
import { ToastService } from '@shared/ui/toast/toast.service';

/* eslint-disable @typescript-eslint/no-empty-function */
describe('errorInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  let authSpy: jest.Mocked<Pick<AuthService, 'logout'>>;
  let toastSpy: jest.Mocked<Pick<ToastService, 'warn' | 'error'>>;
  let router: Router;

  const flushError = (url: string, status: number, body: unknown = null) => {
    httpTesting
      .expectOne(url)
      .flush(body, { status, statusText: String(status) });
  };

  beforeEach(() => {
    authSpy = { logout: jest.fn() };
    toastSpy = { warn: jest.fn(), error: jest.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AuthService, useValue: authSpy },
        { provide: ToastService, useValue: toastSpy },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  afterEach(() => httpTesting.verify());

  it('passes login URL errors through without side-effects', () => {
    let errorThrown = false;
    http
      .get('/api/auth/login/test')
      .subscribe({ error: () => (errorThrown = true) });
    flushError('/api/auth/login/test', 401);

    expect(authSpy.logout).not.toHaveBeenCalled();
    expect(toastSpy.warn).not.toHaveBeenCalled();
    expect(errorThrown).toBe(true);
  });

  it('logs out and redirects on 401', () => {
    http.get('/api/clientes').subscribe({ error: () => {} });
    flushError('/api/clientes', 401);

    expect(authSpy.logout).toHaveBeenCalledTimes(1);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
    expect(toastSpy.warn).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('No autorizado'),
      }),
    );
  });

  it('logs out and redirects on 403', () => {
    http.get('/api/clientes').subscribe({ error: () => {} });
    flushError('/api/clientes', 403);

    expect(authSpy.logout).toHaveBeenCalledTimes(1);
    expect(toastSpy.warn).toHaveBeenCalledTimes(1);
  });

  it('shows server message on 400 when available', () => {
    http.get('/api/clientes').subscribe({ error: () => {} });
    flushError('/api/clientes', 400, { message: 'Campo requerido' });

    expect(toastSpy.error).toHaveBeenCalledWith({ message: 'Campo requerido' });
  });

  it('shows default message on 400 when no server message', () => {
    http.get('/api/clientes').subscribe({ error: () => {} });
    flushError('/api/clientes', 400);

    expect(toastSpy.error).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('inválida') }),
    );
  });

  it('shows warn toast on 404', () => {
    http.get('/api/clientes/999').subscribe({ error: () => {} });
    flushError('/api/clientes/999', 404, { message: 'No existe' });

    expect(toastSpy.warn).toHaveBeenCalledWith({ message: 'No existe' });
  });

  it('shows error toast on 409', () => {
    http.post('/api/clientes', {}).subscribe({ error: () => {} });
    flushError('/api/clientes', 409);

    expect(toastSpy.error).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('Conflicto'),
      }),
    );
  });

  it('shows server error toast on 500', () => {
    http.get('/api/clientes').subscribe({ error: () => {} });
    flushError('/api/clientes', 500);

    expect(toastSpy.error).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('servidor') }),
    );
  });

  it('shows no-connection toast on status 0', () => {
    http.get('/api/clientes').subscribe({ error: () => {} });
    httpTesting.expectOne('/api/clientes').error(new ProgressEvent('error'));

    expect(toastSpy.error).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('conexión') }),
    );
  });

  it('still throws the error after handling so callers can act on it', () => {
    let caughtError: unknown;
    http.get('/api/clientes').subscribe({ error: (e) => (caughtError = e) });
    flushError('/api/clientes', 404);

    expect(caughtError).toBeTruthy();
  });
});
