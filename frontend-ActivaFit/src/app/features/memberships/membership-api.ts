import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Membership, MembershipRegisterPayload } from '../../core/models/membership.model';

/** Único punto de contacto con `/api/memberships/`. No hay `update` ni `remove`. */
@Injectable({ providedIn: 'root' })
export class MembershipApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/memberships`;

  list(): Observable<Membership[]> {
    return this.http.get<Membership[]>(`${this.base}/`);
  }

  get(id: number): Observable<Membership> {
    return this.http.get<Membership>(`${this.base}/${id}/`);
  }

  /** GET /memberships/active/: activas, de clientes y planes activos, y vigentes hoy. */
  active(): Observable<Membership[]> {
    return this.http.get<Membership[]>(`${this.base}/active/`);
  }

  /** POST transaccional: valida cliente, plan y fechas, y crea los pagos. */
  register(payload: MembershipRegisterPayload): Observable<Membership> {
    return this.http.post<Membership>(`${this.base}/`, payload);
  }

  /** DELETE: anula la membresía y sus pagos; conserva las asistencias. */
  voidMembership(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}/`);
  }
}