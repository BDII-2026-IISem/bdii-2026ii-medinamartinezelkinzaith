import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Status } from '../../core/models/api.model';
import { Plan, PlanPayload } from '../../core/models/plan.model';

/** Único punto de contacto con `/api/plans/`. */
@Injectable({ providedIn: 'root' })
export class PlanApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/plans`;

  /** `status` es un filtro opcional: la API publica `?status=active|inactive`. */
  list(status?: Status): Observable<Plan[]> {
    const options = status ? { params: { status } } : {};
    return this.http.get<Plan[]>(`${this.base}/`, options);
  }

  get(id: number): Observable<Plan> {
    return this.http.get<Plan>(`${this.base}/${id}/`);
  }

  create(payload: PlanPayload & { status: Status }): Observable<Plan> {
    return this.http.post<Plan>(`${this.base}/`, payload);
  }

  update(id: number, payload: Partial<PlanPayload>): Observable<Plan> {
    return this.http.patch<Plan>(`${this.base}/${id}/`, payload);
  }

  /** DELETE: baja lógica, responde 204 sin cuerpo. */
  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}/`);
  }
}