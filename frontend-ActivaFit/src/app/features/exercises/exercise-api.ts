import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Status } from '../../core/models/api.model';
import { Exercise, ExercisePayload } from '../../core/models/exercise.model';

/** Único punto de contacto con `/api/exercises/`. */
@Injectable({ providedIn: 'root' })
export class ExerciseApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/exercises`;

  /** `status` es un filtro opcional: la API publica `?status=active|inactive`. */
  list(status?: Status): Observable<Exercise[]> {
    const options = status ? { params: { status } } : {};
    return this.http.get<Exercise[]>(`${this.base}/`, options);
  }

  get(id: number): Observable<Exercise> {
    return this.http.get<Exercise>(`${this.base}/${id}/`);
  }

  create(payload: ExercisePayload & { status: Status }): Observable<Exercise> {
    return this.http.post<Exercise>(`${this.base}/`, payload);
  }

  update(id: number, payload: Partial<ExercisePayload>): Observable<Exercise> {
    return this.http.patch<Exercise>(`${this.base}/${id}/`, payload);
  }

  /** DELETE: baja lógica, responde 204 sin cuerpo. */
  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}/`);
  }
}