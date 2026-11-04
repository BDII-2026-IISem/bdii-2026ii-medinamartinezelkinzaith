import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Measurement, MeasurementPayload } from '../../core/models/measurement.model';

/** Único punto de contacto con `/api/measurements/`. La tabla no tiene `status`. */
@Injectable({ providedIn: 'root' })
export class MeasurementApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/measurements`;

  list(): Observable<Measurement[]> {
    return this.http.get<Measurement[]>(`${this.base}/`);
  }

  get(id: number): Observable<Measurement> {
    return this.http.get<Measurement>(`${this.base}/${id}/`);
  }

  create(payload: MeasurementPayload): Observable<Measurement> {
    return this.http.post<Measurement>(`${this.base}/`, payload);
  }

  update(id: number, payload: Partial<MeasurementPayload>): Observable<Measurement> {
    return this.http.patch<Measurement>(`${this.base}/${id}/`, payload);
  }

  /** DELETE real: elimina la fila, responde 204 sin cuerpo. */
  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}/`);
  }
}