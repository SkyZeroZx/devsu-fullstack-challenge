import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import {
  MovementRequest,
  MovementResponse,
  PagedResponse,
  PageParams,
} from '@core/interface';

@Injectable({ providedIn: 'root' })
export class MovementService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.API_URL}/api/movimientos`;

  getAll(params: PageParams = {}) {
    let httpParams = new HttpParams();
    if (params.page) httpParams = httpParams.set('page', params.page);
    if (params.size) httpParams = httpParams.set('size', params.size);
    if (params.sort) httpParams = httpParams.set('sort', params.sort);
    if (params.search) httpParams = httpParams.set('search', params.search);
    return this.http.get<PagedResponse<MovementResponse>>(this.baseUrl, {
      params: httpParams,
    });
  }

  getById(id: number) {
    return this.http.get<MovementResponse>(`${this.baseUrl}/${id}`);
  }

  create(body: MovementRequest) {
    return this.http.post<MovementResponse>(this.baseUrl, body);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
