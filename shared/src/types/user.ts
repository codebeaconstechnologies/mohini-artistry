export interface User {
  id: number;
  email: string;
  fullName: string;
  phone: string | null;
  isAdmin: boolean;
  createdAt: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface JwtPayload {
  sub: number;
  email: string;
  isAdmin: boolean;
  iat: number;
  exp: number;
}
