import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Status } from '../../core/models/api.model';
import {
  RoutineExercise,
  RoutineExercisePayload,
} from '../../core/models/routine-exercise.model';

/** Único punto de contacto con `/api/routine-exercises/`. */
@Injectable({ providedIn: 'root' })
export class RoutineExerciseApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/routine-exercises`;

  /** `status` es un filtro opcional: la API publica `?status=active|inactive`. */
  list(status?: Status): Observable<RoutineExercise[]> {
    const options = status ? { params: { status } } : {};
    return this.http.get<RoutineExercise[]>(`${this.base}/`, options);
  }

  get(id: number): Observable<RoutineExercise> {
    return this.http.get<RoutineExercise>(`${this.base}/${id}/`);
  }

  create(payload: RoutineExercisePayload & { status: Status }): Observable<RoutineExercise> {
    return this.http.post<RoutineExercise>(`${this.base}/`, payload);
  }

  update(id: number, payload: Partial<RoutineExercisePayload>): Observable<RoutineExercise> {
    return this.http.patch<RoutineExercise>(`${this.base}/${id}/`, payload);
  }

  /** DELETE: baja lógica, responde 204 sin cuerpo. */
  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}/`);
  }
}