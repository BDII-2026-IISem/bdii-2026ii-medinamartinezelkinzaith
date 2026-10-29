import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, tap, throwError } from 'rxjs';
import { TrainerI, TrainerResponseI } from '../../models/business/trainer';
import { API_BASE } from '../auth/auth';

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

@Injectable({ providedIn: 'root' })
export class Trainer {
  private baseUrl = API_BASE + '/api/trainers';
  private subject = new BehaviorSubject<TrainerResponseI[]>([]);
  public items$ = this.subject.asObservable();

  constructor(private http: HttpClient) {}

  getAllTrainers(): Observable<TrainerResponseI[]> {
    return this.http
      .get<PaginatedResponse<TrainerResponseI> | TrainerResponseI[]>(this.baseUrl + '/')
      .pipe(
        map((r) => (Array.isArray(r) ? r : r.results ?? [])),
        tap((items) => this.subject.next(items)),
        catchError((e) => throwError(() => e))
      );
  }

  getTrainerById(id: number): Observable<TrainerResponseI> {
    return this.http.get<TrainerResponseI>(this.baseUrl + '/' + id + '/');
  }

  createTrainer(item: Partial<TrainerI>): Observable<TrainerResponseI> {
    return this.http.post<TrainerResponseI>(this.baseUrl + '/', item).pipe(tap(() => this.refresh()));
  }

  partialUpdateTrainer(id: number, item: Partial<TrainerI>): Observable<TrainerResponseI> {
    return this.http.patch<TrainerResponseI>(this.baseUrl + '/' + id + '/', item).pipe(tap(() => this.refresh()));
  }

  deleteTrainer(id: number): Observable<void> {
    return this.http.delete<void>(this.baseUrl + '/' + id + '/').pipe(tap(() => this.refresh()));
  }

  refresh(): void {
    this.getAllTrainers().subscribe({ error: (e) => console.error('Error refreshing trainers:', e) });
  }
}
