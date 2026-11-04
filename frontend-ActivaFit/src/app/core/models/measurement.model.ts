import { Money, Timestamps } from './api.model';

/** Tabla `measurements` — /api/measurements/. Sin `status`: el DELETE borra la fila. */
export interface Measurement extends Timestamps {
  id: number;
  clientId: number;
  clientName?: string;
  trainerId: number;
  trainerName?: string;
  weight: Money;
  height: Money;
  bodyFat: Money | null;
  bmi: Money | null;
}

export interface MeasurementPayload {
  clientId: number;
  trainerId: number;
  weight: Money;
  height: Money;
  bodyFat: Money | null;
  bmi: Money | null;
}