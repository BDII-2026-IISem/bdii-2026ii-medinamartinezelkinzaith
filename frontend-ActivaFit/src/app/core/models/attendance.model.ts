import { Timestamps } from './api.model';

/** Tabla `attendances` — /api/attendances/. Sin `status`: el DELETE borra la fila. */
export interface Attendance extends Timestamps {
  id: number;
  membershipId: number;
  attendanceDate: string;
  type: string;
}

export interface AttendancePayload {
  membershipId: number;
  attendanceDate?: string;
  type: string;
}