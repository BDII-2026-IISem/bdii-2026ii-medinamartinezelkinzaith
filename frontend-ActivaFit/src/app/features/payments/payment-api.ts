import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Payment } from '../../core/models/payment.model';
import { MembershipApi } from '../memberships/membership-api';

/** Un pago con el cliente y el plan de su membresía. */
export interface PaymentRow extends Payment {
  clientName?: string;
  planName?: string;
}

/** No hay `/api/payments/`: los pagos se aplanan desde `GET /api/memberships/`. */
@Injectable({ providedIn: 'root' })
export class PaymentApi {
  private readonly memberships = inject(MembershipApi);

  list(): Observable<PaymentRow[]> {
    return this.memberships.list().pipe(
      map((memberships) =>
        memberships.flatMap((membership) =>
          (membership.payments ?? []).map((payment) => ({
            ...payment,
            clientName: membership.clientName,
            planName: membership.planName,
          })),
        ),
      ),
    );
  }
}