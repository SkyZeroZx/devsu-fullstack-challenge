export interface AuthRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  role: string;
}

export interface TokenPayload {
  sub: string;
  role: string;
  iat: number;
  exp: number;
}
