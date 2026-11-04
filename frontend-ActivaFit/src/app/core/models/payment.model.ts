import { Money, Status } from './api.model';

/** Tabla `payments`: no tiene recurso propio, viaja dentro de la membresía. */
export interface Payment {
  id: number;
  membership: number;
  method: string;
  amount: Money;
  paymentDate: string;
  status: Status;
}

/** Pago que envía el cliente al registrar la membresía. */
export interface PaymentInput {
  method: string;
  amount: Money;
  paymentDate?: string;
}