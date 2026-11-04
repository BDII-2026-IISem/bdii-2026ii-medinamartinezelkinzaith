import { Status, Timestamps } from './api.model';

/** Tabla `exercises` — /api/exercises/. `name` es único. */
export interface Exercise extends Timestamps {
  id: number;
  name: string;
  description: string | null;
  muscleGroup: string;
  status: Status;
}

export interface ExercisePayload {
  name: string;
  description: string | null;
  muscleGroup: string;
}