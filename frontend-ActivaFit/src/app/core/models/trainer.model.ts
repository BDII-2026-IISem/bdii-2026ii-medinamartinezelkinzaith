import { Status, Timestamps } from './api.model';

/** Tabla `trainers` — /api/trainers/. */
export interface Trainer extends Timestamps {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  specialty: string | null;
  status: Status;
}

export interface TrainerPayload {
  name: string;
  phone: string | null;
  email: string | null;
  specialty: string | null;
}