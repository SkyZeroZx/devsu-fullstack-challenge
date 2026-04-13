import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { MovementService } from './movement.service';
import { environment } from '@env/environment';

const BASE = `${environment.API_URL}/api/movimientos`;

const mockMovement = {
  id: 1,
  fecha: '2024-01-15T10:00:00',
  tipoMovimiento: 'CREDITO',
  valor: 500,
  saldo: 1500,
  numeroCuenta: 'ACC001',
};

const mockPage = {
  content: [mockMovement],
  totalElements: 1,
  totalPages: 1,
  number: 0,
  size: 10,
};

describe('MovementService', () => {
  let service: MovementService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(MovementService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('is created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('calls GET on the base URL with pagination params', () => {
      service.getAll({ page: 1, size: 10 }).subscribe();
      const req = httpTesting.expectOne((r) => r.url === BASE);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('page')).toBe('1');
      req.flush(mockPage);
    });

    it('calls GET without params when none are supplied', () => {
      service.getAll().subscribe();
      const req = httpTesting.expectOne(BASE);
      expect(req.request.method).toBe('GET');
      req.flush(mockPage);
    });
  });

  describe('getById', () => {
    it('calls GET /api/movimientos/:id', () => {
      service.getById(1).subscribe();
      const req = httpTesting.expectOne(`${BASE}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockMovement);
    });
  });

  describe('create', () => {
    it('calls POST on the base URL with the body', () => {
      const payload = {
        tipoMovimiento: 'DEBITO',
        valor: 200,
        numeroCuenta: 'ACC001',
        fecha: '2024-01-15',
      };
      service.create(payload).subscribe();
      const req = httpTesting.expectOne(BASE);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({ ...mockMovement, ...payload });
    });
  });

  describe('delete', () => {
    it('calls DELETE /api/movimientos/:id', () => {
      service.delete(1).subscribe();
      const req = httpTesting.expectOne(`${BASE}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
