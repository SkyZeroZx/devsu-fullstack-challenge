import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import {
  AccountRequest,
  AccountResponse,
  PagedResponse,
  PageParams,
} from '@core/interface';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.API_URL}/api/cuentas`;

  getAll(params: PageParams = {}) {
    let httpParams = new HttpParams();
    if (params.page) httpParams = httpParams.set('page', params.page);
    if (params.size) httpParams = httpParams.set('size', params.size);
    if (params.sort) httpParams = httpParams.set('sort', params.sort);
    if (params.search) httpParams = httpParams.set('search', params.search);
    return this.http.get<PagedResponse<AccountResponse>>(this.baseUrl, {
      params: httpParams,
    });
  }

  getById(numeroCuenta: string) {
    return this.http.get<AccountResponse>(`${this.baseUrl}/${numeroCuenta}`);
  }

  create(body: AccountRequest) {
    return this.http.post<AccountResponse>(this.baseUrl, body);
  }

  update(numeroCuenta: string, body: AccountRequest) {
    return this.http.put<AccountResponse>(
      `${this.baseUrl}/${numeroCuenta}`,
      body,
    );
  }

  patch(numeroCuenta: string, body: Partial<AccountRequest>) {
    return this.http.patch<AccountResponse>(
      `${this.baseUrl}/${numeroCuenta}`,
      body,
    );
  }

  delete(numeroCuenta: string) {
    return this.http.delete<void>(`${this.baseUrl}/${numeroCuenta}`);
  }
}
