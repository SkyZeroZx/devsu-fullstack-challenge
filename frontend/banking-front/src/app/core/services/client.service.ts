import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import {
  ClientRequest,
  ClientResponse,
  PagedResponse,
  PageParams,
} from '@core/interface';

@Injectable({ providedIn: 'root' })
export class ClientService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.API_URL}/api/clientes`;

  getAll(params: PageParams = {}) {
    let httpParams = new HttpParams();
    if (params.page) httpParams = httpParams.set('page', params.page);
    if (params.size) httpParams = httpParams.set('size', params.size);
    if (params.sort) httpParams = httpParams.set('sort', params.sort);
    if (params.search) httpParams = httpParams.set('search', params.search);
    return this.http.get<PagedResponse<ClientResponse>>(this.baseUrl, {
      params: httpParams,
    });
  }

  getById(clienteId: string) {
    return this.http.get<ClientResponse>(`${this.baseUrl}/${clienteId}`);
  }

  create(body: ClientRequest) {
    return this.http.post<ClientResponse>(this.baseUrl, body);
  }

  update(clienteId: string, body: ClientRequest) {
    return this.http.put<ClientResponse>(`${this.baseUrl}/${clienteId}`, body);
  }

  patch(clienteId: string, body: Partial<ClientRequest>) {
    return this.http.patch<ClientResponse>(
      `${this.baseUrl}/${clienteId}`,
      body,
    );
  }

  delete(clienteId: string) {
    return this.http.delete<void>(`${this.baseUrl}/${clienteId}`);
  }
}
