import { Money, Status, Timestamps } from './api.model';

/** Tabla `routine_exercises` — /api/routine-exercises/. */
export interface RoutineExercise extends Timestamps {
  id: number;
  routineId: number;
  exerciseId: number;
  sets: number;
  repetitions: number;
  weight: Money;
  restSeconds: number;
  name: string;
  description: string | null;
  muscleGroup: string;
  status: Status;
}

export interface RoutineExercisePayload {
  routineId: number;
  exerciseId: number;
  sets: number;
  repetitions: number;
  weight: Money;
  restSeconds: number;
  name: string;
  description: string | null;
  muscleGroup: string;
}