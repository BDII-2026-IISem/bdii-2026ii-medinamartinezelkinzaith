import { Status, Timestamps } from './api.model';
import { Payment, PaymentInput } from './payment.model';

/** Tabla `memberships` — /api/memberships/. El listado ya trae `payments`. */
export interface Membership extends Timestamps {
  id: number;
  client: number;
  clientName?: string;
  plan: number;
  planName?: string;
  startDate: string;
  endDate: string;
  status: Status;
  payments: Payment[];
}

/** POST /api/memberships/: una sola transacción con sus pagos. */
export interface MembershipRegisterPayload {
  clientId: number;
  planId: number;
  startDate: string;
  endDate: string;
  payments: PaymentInput[];
}