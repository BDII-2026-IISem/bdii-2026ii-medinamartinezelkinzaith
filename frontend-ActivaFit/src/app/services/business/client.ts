import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, tap, throwError } from 'rxjs';
import { ClientI, ClientResponseI } from '../../models/business/client';

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

@Injectable({ providedIn: 'root' })
export class Client {
  private baseUrl = 'http://127.0.0.1:8000/api/clients';
  private clientsSubject = new BehaviorSubject<ClientResponseI[]>([]);
  public clients$ = this.clientsSubject.asObservable();

  constructor(private http: HttpClient) {}

  getAllClients(): Observable<ClientResponseI[]> {
    return this.http
      .get<PaginatedResponse<ClientResponseI> | ClientResponseI[]>(`${this.baseUrl}/`)
      .pipe(
        map((r) => (Array.isArray(r) ? r : r.results ?? [])),
        tap((clients) => this.clientsSubject.next(clients)),
        catchError((e) => throwError(() => e))
      );
  }

  getClientById(id: number): Observable<ClientResponseI> {
    return this.http.get<ClientResponseI>(`${this.baseUrl}/${id}/`);
  }

  createClient(client: ClientI): Observable<ClientResponseI> {
    return this.http.post<ClientResponseI>(`${this.baseUrl}/`, client)
      .pipe(tap(() => this.refreshClients()));
  }

  updateClient(id: number, client: ClientI): Observable<ClientResponseI> {
    return this.http.put<ClientResponseI>(`${this.baseUrl}/${id}/`, client)
      .pipe(tap(() => this.refreshClients()));
  }

  partialUpdateClient(id: number, client: Partial<ClientI>): Observable<ClientResponseI> {
    return this.http.patch<ClientResponseI>(`${this.baseUrl}/${id}/`, client)
      .pipe(tap(() => this.refreshClients()));
  }

  deleteClient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}/`)
      .pipe(tap(() => this.refreshClients()));
  }

  refreshClients(): void {
    this.getAllClients().subscribe({
      error: (e) => console.error('Error refreshing clients:', e),
    });
  }
}
