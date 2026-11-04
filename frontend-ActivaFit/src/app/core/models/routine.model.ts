import { Status, Timestamps } from './api.model';

/** Tabla `routines` — /api/routines/. */
export interface Routine extends Timestamps {
  id: number;
  trainerId: number;
  trainerName?: string;
  clientId: number;
  clientName?: string;
  name: string;
  description: string | null;
  status: Status;
}

export interface RoutinePayload {
  trainerId: number;
  clientId: number;
  name: string;
  description: string | null;
}