import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AccountService } from './account.service';
import { environment } from '@env/environment';

const BASE = `${environment.API_URL}/api/cuentas`;

const mockAccount = {
  numeroCuenta: 'ACC001',
  tipoCuenta: 'AHORRO',
  saldoInicial: 1000,
  estado: true,
  cliente: 'Maria',
  clienteId: 'c1',
};

const mockPage = {
  content: [mockAccount],
  totalElements: 1,
  totalPages: 1,
  number: 0,
  size: 10,
};

describe('AccountService', () => {
  let service: AccountService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AccountService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('is created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('calls GET on the base URL with page and size params', () => {
      service.getAll({ page: 2, size: 10 }).subscribe();
      const req = httpTesting.expectOne((r) => r.url === BASE);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('page')).toBe('2');
      req.flush(mockPage);
    });
  });

  describe('getById', () => {
    it('calls GET /api/cuentas/:numeroCuenta', () => {
      service.getById('ACC001').subscribe();
      const req = httpTesting.expectOne(`${BASE}/ACC001`);
      expect(req.request.method).toBe('GET');
      req.flush(mockAccount);
    });
  });

  describe('create', () => {
    it('calls POST on the base URL', () => {
      const payload = {
        numeroCuenta: 'ACC002',
        tipoCuenta: 'AHORRO',
        saldoInicial: 500,
        estado: true,
        clienteId: 'c1',
      };
      service.create(payload).subscribe();
      const req = httpTesting.expectOne(BASE);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({ ...mockAccount, numeroCuenta: 'ACC002' });
    });
  });

  describe('update', () => {
    it('calls PUT /api/cuentas/:numeroCuenta', () => {
      const payload = {
        numeroCuenta: 'ACC001',
        tipoCuenta: 'CORRIENTE',
        saldoInicial: 1000,
        estado: true,
        clienteId: 'c1',
      };
      service.update('ACC001', payload).subscribe();
      const req = httpTesting.expectOne(`${BASE}/ACC001`);
      expect(req.request.method).toBe('PUT');
      req.flush(mockAccount);
    });
  });

  describe('delete', () => {
    it('calls DELETE /api/cuentas/:numeroCuenta', () => {
      service.delete('ACC001').subscribe();
      const req = httpTesting.expectOne(`${BASE}/ACC001`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
