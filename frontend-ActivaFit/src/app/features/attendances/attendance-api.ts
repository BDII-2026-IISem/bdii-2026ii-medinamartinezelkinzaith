import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Attendance, AttendancePayload } from '../../core/models/attendance.model';

/** Único punto de contacto con `/api/attendances/`. La tabla no tiene `status`. */
@Injectable({ providedIn: 'root' })
export class AttendanceApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/attendances`;

  list(): Observable<Attendance[]> {
    return this.http.get<Attendance[]>(`${this.base}/`);
  }

  get(id: number): Observable<Attendance> {
    return this.http.get<Attendance>(`${this.base}/${id}/`);
  }

  create(payload: AttendancePayload): Observable<Attendance> {
    return this.http.post<Attendance>(`${this.base}/`, payload);
  }

  update(id: number, payload: Partial<AttendancePayload>): Observable<Attendance> {
    return this.http.patch<Attendance>(`${this.base}/${id}/`, payload);
  }

  /** DELETE real: elimina la fila, responde 204 sin cuerpo. */
  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}/`);
  }
}