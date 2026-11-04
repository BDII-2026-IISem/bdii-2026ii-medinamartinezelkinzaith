import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { filterRows } from '../../../core/utils/filter-rows';
import { toApiMessage } from '../../../core/utils/to-api-message';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../../shared/ui/page-header/page-header';
import { StatusTag } from '../../../shared/ui/status-tag/status-tag';
import { PaymentApi, PaymentRow } from '../payment-api';

/** Todos los pagos de todas las membresías, con enlace de vuelta al detalle. */
@Component({
  host: { class: 'block' },
  selector: 'app-payment-list',
  imports: [
    CurrencyPipe,
    DatePipe,
    EmptyState,
    InputTextModule,
    MessageModule,
    PageHeader,
    RouterLink,
    StatusTag,
    TableModule,
    TagModule,
  ],
  templateUrl: './payment-list.html',
  styleUrl: './payment-list.css',
})
export class PaymentList {
  private readonly api = inject(PaymentApi);

  readonly rows = signal<PaymentRow[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly filter = signal('');

  readonly visibleRows = computed(() =>
    filterRows(this.rows(), this.filter(), (p) => [p.membership, p.clientName, p.planName, p.method]),
  );

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.list().subscribe({
      next: (rows) => {
        this.rows.set(rows);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.rows.set([]);
        this.error.set(toApiMessage(error));
        this.loading.set(false);
      },
    });
  }
}