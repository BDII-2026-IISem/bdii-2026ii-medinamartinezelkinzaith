import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Status } from '../../core/models/api.model';
import { Trainer, TrainerPayload } from '../../core/models/trainer.model';

/** Único punto de contacto con `/api/trainers/`. */
@Injectable({ providedIn: 'root' })
export class TrainerApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/trainers`;
  /** `status` es un filtro opcional: la API publica `?status=active|inactive`. */
  list(status?: Status): Observable<Trainer[]> {
    const options = status ? { params: { status } } : {};
    return this.http.get<Trainer[]>(`${this.base}/`, options);
  }

  get(id: number): Observable<Trainer> {
    return this.http.get<Trainer>(`${this.base}/${id}/`);
  }

  /** El alta envía `status: 'active'`: en la base el registro nace `inactive`. */
  create(payload: TrainerPayload & { status: Status }): Observable<Trainer> {
    return this.http.post<Trainer>(`${this.base}/`, payload);
  }

  update(id: number, payload: Partial<TrainerPayload>): Observable<Trainer> {
    return this.http.patch<Trainer>(`${this.base}/${id}/`, payload);
  }

  /** DELETE: baja lógica, responde 204 sin cuerpo. */
  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}/`);
  }
}