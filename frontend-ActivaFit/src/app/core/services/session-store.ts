import { Injectable, computed, signal } from '@angular/core';
import { EffectivePermission, SessionUser, TokenPair } from '../models/auth.model';

const STORAGE_KEY = 'activafit.session.v1';

interface StoredSession {
  access: string;
  refresh: string;
  user: SessionUser | null;
  permissions: EffectivePermission[];
}

/** Única fuente de verdad de la sesión; el backend sigue siendo la autoridad. */
@Injectable({ providedIn: 'root' })
export class SessionStore {
  private readonly _accessToken = signal<string | null>(null);
  private readonly _refreshToken = signal<string | null>(null);
  private readonly _user = signal<SessionUser | null>(null);
  private readonly _permissions = signal<EffectivePermission[]>([]);

  readonly accessToken = this._accessToken.asReadonly();
  readonly refreshToken = this._refreshToken.asReadonly();
  readonly user = this._user.asReadonly();
  readonly permissions = this._permissions.asReadonly();

  readonly isAuthenticated = computed(() => this._accessToken() !== null);
  readonly permissionCount = computed(() => this._permissions().length);
  /** Roles de la matriz efectiva: no hay un endpoint de roles del usuario. */
  readonly roles = computed(() =>
    [...new Set(this._permissions().map((permission) => permission.roleName))].sort(),
  );

  constructor() {
    this.restore();
  }

  setTokens(tokens: TokenPair): void {
    this._accessToken.set(tokens.access);
    this._refreshToken.set(tokens.refresh);
    this.persist();
  }

  setUser(user: SessionUser, permissions: EffectivePermission[]): void {
    this._user.set(user);
    this._permissions.set(permissions);
    this.persist();
  }

  clear(): void {
    this._accessToken.set(null);
    this._refreshToken.set(null);
    this._user.set(null);
    this._permissions.set([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* sin almacenamiento disponible */
    }
  }

  /** canPermission('PATCH /api/clients/7') contra `PATCH /api/clients/:id`. */
  canPermission(key: string): boolean {
    const separator = key.indexOf(' ');
    if (separator < 0) {
      return false;
    }
    const method = key.slice(0, separator).toUpperCase();
    const path = key.slice(separator + 1);
    return this._permissions().some(
      (permission) => permission.method === method && samePath(permission.path, path),
    );
  }

  private restore(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return;
      }
      const data = JSON.parse(raw) as StoredSession;
      if (!Array.isArray(data.permissions)) {
        this.clear();
        return;
      }
      this._accessToken.set(data.access || null);
      this._refreshToken.set(data.refresh || null);
      this._user.set(data.user ?? null);
      this._permissions.set(data.permissions);
    } catch {
      this.clear();
    }
  }

  private persist(): void {
    const data: StoredSession = {
      access: this._accessToken() ?? '',
      refresh: this._refreshToken() ?? '',
      user: this._user(),
      permissions: this._permissions(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* cuota llena: la sesión sigue viva en memoria */
    }
  }
}

/** El `:id` del catálogo reconoce el número real; la query y la barra final se ignoran. */
function samePath(pattern: string, path: string): boolean {
  const trim = (value: string): string => value.split('?')[0].replace(/(.)\/+$/, '$1');
  const body = trim(pattern)
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\/:[^/]+/g, '/[^/]+');
  return new RegExp(`^${body}$`).test(trim(path));
}