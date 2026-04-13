import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';
import { AuthRequest, AuthResponse, TokenPayload } from '@core/interface';
import { environment } from '@env/environment';

const TOKEN_KEY = 'auth_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.API_URL}/auth`;

  private readonly _token = signal<string | null>(this.loadToken());

  readonly token = this._token.asReadonly();

  readonly user = computed<TokenPayload | null>(() => {
    const t = this._token();
    if (!t) return null;
    try {
      return jwtDecode<TokenPayload>(t);
    } catch {
      return null;
    }
  });

  readonly isAuthenticated = computed(() => {
    const u = this.user();
    if (!u) return false;
    return u.exp * 1000 > Date.now();
  });

  setToken(token: string): void {
    sessionStorage.setItem(TOKEN_KEY, token);
    this._token.set(token);
  }

  logout(): void {
    sessionStorage.removeItem(TOKEN_KEY);
    this._token.set(null);
  }

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

  private loadToken(): string | null {
    return sessionStorage.getItem(TOKEN_KEY);
  }
}
