import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, tap, throwError } from 'rxjs';
import { PlanI, PlanResponseI } from '../../models/business/plan';
import { API_BASE } from '../auth/auth';

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

@Injectable({ providedIn: 'root' })
export class Plan {
  private baseUrl = API_BASE + '/api/plans';
  private subject = new BehaviorSubject<PlanResponseI[]>([]);
  public items$ = this.subject.asObservable();

  constructor(private http: HttpClient) {}

  getAllPlans(): Observable<PlanResponseI[]> {
    return this.http
      .get<PaginatedResponse<PlanResponseI> | PlanResponseI[]>(this.baseUrl + '/')
      .pipe(
        map((r) => (Array.isArray(r) ? r : r.results ?? [])),
        tap((items) => this.subject.next(items)),
        catchError((e) => throwError(() => e))
      );
  }

  getPlanById(id: number): Observable<PlanResponseI> {
    return this.http.get<PlanResponseI>(this.baseUrl + '/' + id + '/');
  }

  createPlan(item: Partial<PlanI>): Observable<PlanResponseI> {
    return this.http.post<PlanResponseI>(this.baseUrl + '/', item).pipe(tap(() => this.refresh()));
  }

  partialUpdatePlan(id: number, item: Partial<PlanI>): Observable<PlanResponseI> {
    return this.http.patch<PlanResponseI>(this.baseUrl + '/' + id + '/', item).pipe(tap(() => this.refresh()));
  }

  deletePlan(id: number): Observable<void> {
    return this.http.delete<void>(this.baseUrl + '/' + id + '/').pipe(tap(() => this.refresh()));
  }

  refresh(): void {
    this.getAllPlans().subscribe({ error: (e) => console.error('Error refreshing plans:', e) });
  }
}
