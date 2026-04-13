import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ClientService } from './client.service';
import { environment } from '@env/environment';

const BASE = `${environment.API_URL}/api/clientes`;

const mockPage = {
  content: [
    {
      clienteId: 'c1',
      nombre: 'Maria',
      identificacion: '001',
      genero: 'F',
      edad: 30,
      direccion: 'Av 1',
      telefono: '111',
      estado: true,
    },
  ],
  totalElements: 1,
  totalPages: 1,
  number: 0,
  size: 10,
};

describe('ClientService', () => {
  let service: ClientService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ClientService);
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
      expect(req.request.params.get('size')).toBe('10');
      req.flush(mockPage);
    });

    it('calls GET without params when none supplied', () => {
      service.getAll().subscribe();
      const req = httpTesting.expectOne(BASE);
      expect(req.request.method).toBe('GET');
      req.flush(mockPage);
    });
  });

  describe('getById', () => {
    it('calls GET /api/clientes/:id', () => {
      service.getById('c1').subscribe();
      const req = httpTesting.expectOne(`${BASE}/c1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPage.content[0]);
    });
  });

  describe('create', () => {
    it('calls POST on the base URL with the body', () => {
      const payload = {
        nombre: 'Pedro',
        identificacion: '002',
        genero: 'M',
        edad: 25,
        direccion: 'Calle 2',
        telefono: '222',
        estado: true,
        contrasena: 'pass',
      };
      service.create(payload).subscribe();
      const req = httpTesting.expectOne(BASE);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({ ...payload, clienteId: 'c2' });
    });
  });

  describe('update', () => {
    it('calls PUT /api/clientes/:id', () => {
      const payload = {
        nombre: 'Pedro',
        identificacion: '002',
        genero: 'M',
        edad: 25,
        direccion: 'Calle 2',
        telefono: '222',
        estado: true,
        contrasena: 'pass',
      };
      service.update('c1', payload).subscribe();
      const req = httpTesting.expectOne(`${BASE}/c1`);
      expect(req.request.method).toBe('PUT');
      req.flush({ ...payload, clienteId: 'c1' });
    });
  });

  describe('delete', () => {
    it('calls DELETE /api/clientes/:id', () => {
      service.delete('c1').subscribe();
      const req = httpTesting.expectOne(`${BASE}/c1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
