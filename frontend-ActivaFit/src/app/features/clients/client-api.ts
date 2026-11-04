import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Status } from '../../core/models/api.model';
import { Client, ClientPayload } from '../../core/models/client.model';

/** Único punto de contacto con `/api/clients/`. */
@Injectable({ providedIn: 'root' })
export class ClientApi {
  private readonly http = inject(HttpClient);
  /** Sin barra final: el sufijo `/` se agrega en cada método, a la vista. */
  private readonly base = `${environment.apiUrl}/clients`;
  /** `status` es un filtro opcional: la API publica `?status=active|inactive`. */
  list(status?: Status): Observable<Client[]> {
    const options = status ? { params: { status } } : {};
    return this.http.get<Client[]>(`${this.base}/`, options);
  }
  get(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.base}/${id}/`);
  }

  /** El alta envía `status: 'active'`: en la base el registro nace `inactive`. */
  create(payload: ClientPayload & { status: Status }): Observable<Client> {
    return this.http.post<Client>(`${this.base}/`, payload);
  }

  /** PATCH: el formulario envía solo los campos que cambiaron. */
  update(id: number, payload: Partial<ClientPayload>): Observable<Client> {
    return this.http.patch<Client>(`${this.base}/${id}/`, payload);
  }

  /** DELETE: baja lógica, responde 204 sin cuerpo. */
  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}/`);
  }
}