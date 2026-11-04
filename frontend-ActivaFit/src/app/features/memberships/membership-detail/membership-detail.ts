import { CurrencyPipe, DatePipe } from '@angular/common';
import { HasPermission } from '../../../shared/directives/has-permission';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { toNumber } from '../../../core/models/api.model';
import { Membership } from '../../../core/models/membership.model';
import { NotificationService } from '../../../core/services/notification.service';
import { toApiMessage } from '../../../core/utils/to-api-message';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../../shared/ui/page-header/page-header';
import { StatusTag } from '../../../shared/ui/status-tag/status-tag';
import { MembershipApi } from '../membership-api';

/** Cabecera y pagos de una membresía, tal como los devolvió el servidor. */
@Component({
  host: { class: 'block' },
  selector: 'app-membership-detail',
  imports: [
    HasPermission,
    ButtonModule,
    CardModule,
    CurrencyPipe,
    DatePipe,
    EmptyState,
    MessageModule,
    PageHeader,
    RouterLink,
    StatusTag,
    TableModule,
  ],
  templateUrl: './membership-detail.html',
  styleUrl: './membership-detail.css',
})
export class MembershipDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(MembershipApi);
  private readonly notify = inject(NotificationService);
  private readonly confirmation = inject(ConfirmationService);

  readonly id = Number(this.route.snapshot.paramMap.get('id'));

  readonly membership = signal<Membership | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly isVoided = computed(() => this.membership()?.status === 'inactive');

  /** Suma de los pagos activos que se muestran: no es un dato del servidor. */
  readonly totalPaid = computed(() =>
    (this.membership()?.payments ?? [])
      .filter((payment) => payment.status === 'active')
      .reduce((sum, payment) => sum + toNumber(payment.amount), 0),
  );

  constructor() {
    this.load();
  }

  load(): void {
    if (!Number.isInteger(this.id) || this.id <= 0) {
      this.error.set('La dirección no trae un número de membresía válido.');
      this.loading.set(false);
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.api.get(this.id).subscribe({
      next: (membership) => {
        this.membership.set(membership);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.membership.set(null);
        this.error.set(toApiMessage(error));
        this.loading.set(false);
      },
    });
  }

  /** Anular dos veces no repite el efecto: el servidor ya responde sin cambios. */
  voidMembership(): void {
    const current = this.membership();
    if (!current || current.status === 'inactive') return;
    this.confirmation.confirm({
      header: 'Anular membresía',
      message: `¿Anular la membresía #${current.id}? Se desactivan la membresía y sus pagos; las asistencias se conservan.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Anular',
      rejectLabel: 'Cancelar',
      accept: () =>
        this.api.voidMembership(current.id).subscribe({
          next: () => {
            this.notify.warn('Membresía anulada');
            this.load();
          },
          error: (error: unknown) => this.notify.error('No se pudo anular', toApiMessage(error)),
        }),
    });
  }
}