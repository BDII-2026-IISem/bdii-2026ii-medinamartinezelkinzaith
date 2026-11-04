import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Status } from '../../core/models/api.model';
import { Routine, RoutinePayload } from '../../core/models/routine.model';

/** Único punto de contacto con `/api/routines/`. */
@Injectable({ providedIn: 'root' })
export class RoutineApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/routines`;

  /** `status` es un filtro opcional: la API publica `?status=active|inactive`. */
  list(status?: Status): Observable<Routine[]> {
    const options = status ? { params: { status } } : {};
    return this.http.get<Routine[]>(`${this.base}/`, options);
  }

  get(id: number): Observable<Routine> {
    return this.http.get<Routine>(`${this.base}/${id}/`);
  }

  create(payload: RoutinePayload & { status: Status }): Observable<Routine> {
    return this.http.post<Routine>(`${this.base}/`, payload);
  }

  update(id: number, payload: Partial<RoutinePayload>): Observable<Routine> {
    return this.http.patch<Routine>(`${this.base}/${id}/`, payload);
  }

  /** DELETE: baja lógica, responde 204 sin cuerpo. */
  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}/`);
  }
}