import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

const VALID_TOKEN =
  // Header: {"alg":"HS256","typ":"JWT"} | Payload: {"sub":"user1","role":"USER","exp":9999999999}
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  'eyJzdWIiOiJ1c2VyMSIsInJvbGUiOiJVU0VSIiwiZXhwIjo5OTk5OTk5OTk5fQ.' +
  'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

const EXPIRED_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  'eyJzdWIiOiJ1c2VyMSIsInJvbGUiOiJVU0VSIiwiZXhwIjoxfQ.' +
  'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  afterEach(() => sessionStorage.clear());

  it('is created', () => {
    expect(service).toBeTruthy();
  });

  describe('setToken', () => {
    it('stores the token in sessionStorage', () => {
      service.setToken(VALID_TOKEN);
      expect(sessionStorage.getItem('auth_token')).toBe(VALID_TOKEN);
    });

    it('updates token() signal', () => {
      service.setToken(VALID_TOKEN);
      expect(service.token()).toBe(VALID_TOKEN);
    });
  });

  describe('logout', () => {
    it('clears sessionStorage on logout', () => {
      service.setToken(VALID_TOKEN);
      service.logout();
      expect(sessionStorage.getItem('auth_token')).toBeNull();
    });

    it('sets token() signal to null', () => {
      service.setToken(VALID_TOKEN);
      service.logout();
      expect(service.token()).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('returns false when no token is stored', () => {
      expect(service.isAuthenticated()).toBe(false);
    });

    it('returns false for an expired token', () => {
      service.setToken(EXPIRED_TOKEN);
      expect(service.isAuthenticated()).toBe(false);
    });

    it('returns true for a valid non-expired token', () => {
      service.setToken(VALID_TOKEN);
      expect(service.isAuthenticated()).toBe(true);
    });
  });

  describe('user', () => {
    it('returns null when no token is present', () => {
      expect(service.user()).toBeNull();
    });

    it('decodes and returns payload for a valid token', () => {
      service.setToken(VALID_TOKEN);
      const user = service.user();
      expect(user).not.toBeNull();
      expect(user?.sub).toBe('user1');
    });

    it('returns null for an unparseable token', () => {
      service.setToken('not.a.token');
      expect(service.user()).toBeNull();
    });
  });
});
