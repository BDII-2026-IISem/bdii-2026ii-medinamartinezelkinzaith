import { CurrencyPipe } from '@angular/common';
import { HasPermission } from '../../../shared/directives/has-permission';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { forkJoin } from 'rxjs';
import { toNumber } from '../../../core/models/api.model';
import { Client } from '../../../core/models/client.model';
import { Membership, MembershipRegisterPayload } from '../../../core/models/membership.model';
import { Plan } from '../../../core/models/plan.model';
import { NotificationService } from '../../../core/services/notification.service';
import { filterRows } from '../../../core/utils/filter-rows';
import { toApiMessage } from '../../../core/utils/to-api-message';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../../shared/ui/page-header/page-header';
import { StatusTag } from '../../../shared/ui/status-tag/status-tag';
import { ClientApi } from '../../clients/client-api';
import { PlanApi } from '../../plans/plan-api';
import { MembershipApi } from '../membership-api';
import { MembershipForm } from '../membership-form/membership-form';

/** Dueña del estado de las membresías. La anulación se hace en el detalle, no aquí. */
@Component({
  host: { class: 'block' },
  selector: 'app-membership-list',
  imports: [
    HasPermission,
    ButtonModule,
    CurrencyPipe,
    DialogModule,
    EmptyState,
    InputTextModule,
    MembershipForm,
    MessageModule,
    PageHeader,
    RouterLink,
    StatusTag,
    TableModule,
    TagModule,
  ],
  templateUrl: './membership-list.html',
  styleUrl: './membership-list.css',
})
export class MembershipList {
  private readonly api = inject(MembershipApi);
  private readonly clientsApi = inject(ClientApi);
  private readonly plansApi = inject(PlanApi);
  private readonly notify = inject(NotificationService);

  readonly rows = signal<Membership[]>([]);
  readonly clients = signal<Client[]>([]);
  readonly plans = signal<Plan[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly registerError = signal<string | null>(null);
  readonly filter = signal('');
  readonly dialogVisible = signal(false);
  readonly resetKey = signal(0);

  private readonly clientNames = computed(
    () => new Map(this.clients().map((client) => [client.id, client.name])),
  );
  private readonly planNames = computed(
    () => new Map(this.plans().map((plan) => [plan.id, plan.name])),
  );

  readonly visibleRows = computed(() =>
    filterRows(this.rows(), this.filter(), (m) => [
      m.id,
      this.clientLabel(m),
      this.planLabel(m),
      m.startDate,
      m.endDate,
    ]),
  );

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      memberships: this.api.list(),
      clients: this.clientsApi.list('active'),
      plans: this.plansApi.list('active'),
    }).subscribe({
      next: ({ memberships, clients, plans }) => {
        this.rows.set(memberships);
        this.clients.set(clients);
        this.plans.set(plans);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.rows.set([]);
        this.error.set(toApiMessage(error));
        this.loading.set(false);
      },
    });
  }

  clientLabel(membership: Membership): string {
    return (
      membership.clientName ??
      this.clientNames().get(membership.client) ??
      `Cliente #${membership.client}`
    );
  }

  planLabel(membership: Membership): string {
    return membership.planName ?? this.planNames().get(membership.plan) ?? `Plan #${membership.plan}`;
  }

  /** Suma solo los pagos activos: una membresía anulada deja de mostrar importe. */
  totalPaid(membership: Membership): number {
    return membership.payments
      .filter((payment) => payment.status === 'active')
      .reduce((sum, payment) => sum + toNumber(payment.amount), 0);
  }

  openRegister(): void {
    this.registerError.set(null);
    this.resetKey.update((key) => key + 1);
    this.dialogVisible.set(true);
  }

  save(payload: MembershipRegisterPayload): void {
    this.saving.set(true);
    this.registerError.set(null);
    this.api.register(payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogVisible.set(false);
        this.notify.success('Membresía registrada');
        this.load();
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.registerError.set(toApiMessage(error));
      },
    });
  }
}