import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { forkJoin } from 'rxjs';
import { toNumber } from '../../core/models/api.model';
import { Client } from '../../core/models/client.model';
import { Membership } from '../../core/models/membership.model';
import { toApiMessage } from '../../core/utils/to-api-message';
import { EmptyState } from '../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../shared/ui/page-header/page-header';
import { ClientApi } from '../clients/client-api';
import { toDateOnly } from '../memberships/membership-date';
import { MembershipApi } from '../memberships/membership-api';

const EXPIRING_DAYS = 7;

/** Misma fecha local, sin pasar por UTC. */
function sameDay(iso: string, reference: Date): boolean {
  const date = new Date(iso);
  return (
    date.getFullYear() === reference.getFullYear() &&
    date.getMonth() === reference.getMonth() &&
    date.getDate() === reference.getDate()
  );
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

/** Cuatro cifras derivadas de tres respuestas del servidor. */
@Component({
  host: { class: 'block' },
  selector: 'app-dashboard',
  imports: [
    ButtonModule,
    CardModule,
    CurrencyPipe,
    EmptyState,
    MessageModule,
    PageHeader,
    RouterLink,
    TableModule,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private readonly memberships = inject(MembershipApi);
  private readonly clientsApi = inject(ClientApi);

  readonly rows = signal<Membership[]>([]);
  readonly valid = signal<Membership[]>([]);
  readonly clients = signal<Client[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  /** Día de referencia: se renueva en cada carga. */
  private readonly reference = signal(new Date());

  /** Membresías vigentes hoy, según `GET /api/memberships/active/`. */
  readonly validCount = computed(() => this.valid().length);

  private readonly todayPayments = computed(() =>
    this.rows()
      .flatMap((membership) => membership.payments)
      .filter((payment) => payment.status === 'active' && sameDay(payment.paymentDate, this.reference())),
  );
  readonly todayCount = computed(() => this.todayPayments().length);
  readonly todayTotal = computed(() =>
    this.todayPayments().reduce((sum, payment) => sum + toNumber(payment.amount), 0),
  );

  /** Membresías activas que vencen en los próximos 7 días, la más próxima primero. */
  readonly expiring = computed(() => {
    const from = toDateOnly(this.reference());
    const limit = toDateOnly(addDays(this.reference(), EXPIRING_DAYS));
    return this.rows()
      .filter((m) => m.status === 'active' && m.endDate >= from && m.endDate <= limit)
      .sort((a, b) => a.endDate.localeCompare(b.endDate));
  });

  readonly clientsCount = computed(() => this.clients().length);

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.reference.set(new Date());
    forkJoin({
      memberships: this.memberships.list(),
      valid: this.memberships.active(),
      clients: this.clientsApi.list('active'),
    }).subscribe({
      next: ({ memberships, valid, clients }) => {
        this.rows.set(memberships);
        this.valid.set(valid);
        this.clients.set(clients);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.rows.set([]);
        this.valid.set([]);
        this.clients.set([]);
        this.error.set(toApiMessage(error));
        this.loading.set(false);
      },
    });
  }

  daysLeft(membership: Membership): string {
    const end = new Date(`${membership.endDate}T00:00:00`);
    const today = this.reference();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const days = Math.round((end.getTime() - start.getTime()) / 86_400_000);
    if (days <= 0) return 'vence hoy';
    return days === 1 ? 'vence mañana' : `vence en ${days} días`;
  }
}