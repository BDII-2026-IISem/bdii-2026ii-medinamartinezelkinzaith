import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, finalize, shareReplay, tap, catchError, of, map } from 'rxjs';
import { TokenPairI } from '../../models/auth/auth';

export const API_BASE = 'http://127.0.0.1:8000';

@Injectable({ providedIn: 'root' })
export class Auth {
  private baseUrl = `${API_BASE}/api/auth`;
  private refreshInFlight$: Observable<TokenPairI> | null = null;

  loggedIn = signal(!!localStorage.getItem('access'));

  constructor(private http: HttpClient) {}

  get accessToken(): string | null {
    return localStorage.getItem('access');
  }

  get refreshToken(): string | null {
    return localStorage.getItem('refresh');
  }

  login(identifier: string, password: string): Observable<TokenPairI> {
    const body = identifier.includes('@')
      ? { email: identifier, password }
      : { username: identifier, password };
    return this.http.post<TokenPairI>(`${this.baseUrl}/login/`, body).pipe(
      tap((t) => this.save(t))
    );
  }

  refresh(): Observable<TokenPairI> {
    if (!this.refreshInFlight$) {
      this.refreshInFlight$ = this.http
        .post<TokenPairI>(`${this.baseUrl}/refresh/`, { refresh: this.refreshToken })
        .pipe(
          tap((t) => this.save(t)),
          finalize(() => (this.refreshInFlight$ = null)),
          shareReplay(1)
        );
    }
    return this.refreshInFlight$;
  }

  logout(): Observable<void> {
    const refresh = this.refreshToken;
    this.clear();
    if (!refresh) return of(void 0);
    return this.http.post(`${this.baseUrl}/logout/`, { refresh }).pipe(
      map(() => void 0),
      catchError(() => of(void 0))
    );
  }

  clear(): void {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    this.loggedIn.set(false);
  }

  private save(t: TokenPairI): void {
    localStorage.setItem('access', t.access);
    localStorage.setItem('refresh', t.refresh);
    this.loggedIn.set(true);
  }
}
