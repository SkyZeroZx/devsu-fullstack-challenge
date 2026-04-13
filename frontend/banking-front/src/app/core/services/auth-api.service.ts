import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { AuthRequest, AuthResponse } from '@core/interface';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.API_URL}/auth`;

  login(body: AuthRequest) {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, body);
  }

  register(body: AuthRequest) {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, body);
  }

  validate(token: string) {
    const params = new HttpParams().set('token', token);
    return this.http.get<{ valid: boolean; username: string; role: string }>(
      `${this.baseUrl}/validate`,
      { params },
    );
  }
}
