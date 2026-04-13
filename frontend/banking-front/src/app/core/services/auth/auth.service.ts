import { computed, Injectable, signal } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { TokenPayload } from '@core/interface';

const TOKEN_KEY = 'auth_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
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
    localStorage.setItem(TOKEN_KEY, token);
    this._token.set(token);
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this._token.set(null);
  }

  private loadToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }
}
