import { Status, Timestamps } from './api.model';

/** Tabla `plans` — /api/plans/. `name` es único. */
export interface Plan extends Timestamps {
  id: number;
  name: string;
  description: string | null;
  status: Status;
}

export interface PlanPayload {
  name: string;
  description: string | null;
}