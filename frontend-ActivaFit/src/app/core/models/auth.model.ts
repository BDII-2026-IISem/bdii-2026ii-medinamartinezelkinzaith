import { HttpMethod, Status } from './api.model';

/** Cuerpo del login: `username` o `email`, nunca `identifier`. */
export interface LoginRequest {
  username?: string;
  email?: string;
  password: string;
}

/** Par que emiten el login y el refresh. El refresh rota en cada uso. */
export interface TokenPair {
  access: string;
  refresh: string;
  tokenType: 'Bearer';
  accessExpiresIn: number;
}

/** GET /api/auth/profile/: el usuario llega directo, sin envoltorio. */
export interface SessionUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  status: Status;
}

/** Una fila de `GET /api/auth/permissions/`. La clave es `method + ' ' + path`. */
export interface EffectivePermission {
  method: HttpMethod;
  path: string;
  roleId: number;
  roleName: string;
}