import { Status, Timestamps } from './api.model';

/** Tabla `clients` — /api/clients/. */
export interface Client extends Timestamps {
  id: number;
  documentType: string;
  documentNumber: string;
  name: string;
  phone: string | null;
  email: string | null;
  status: Status;
}

/** Cuerpo de `POST` y `PATCH`: sin `id` y sin `status` (lo cambia la baja). */
export interface ClientPayload {
  documentType: string;
  documentNumber: string;
  name: string;
  phone: string | null;
  email: string | null;
}