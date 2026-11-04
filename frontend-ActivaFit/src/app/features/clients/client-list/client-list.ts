import { Component, computed, inject, signal } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { Client, ClientPayload } from '../../../core/models/client.model';
import { NotificationService } from '../../../core/services/notification.service';
import { filterRows } from '../../../core/utils/filter-rows';
import { toApiMessage } from '../../../core/utils/to-api-message';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { HasPermission } from '../../../shared/directives/has-permission';
import { PageHeader } from '../../../shared/ui/page-header/page-header';
import { StatusTag } from '../../../shared/ui/status-tag/status-tag';
import { ClientApi } from '../client-api';
import { ClientForm } from '../client-form/client-form';

/** Dueña del estado del CRUD: tabla y diálogo se derivan de estos signals. */
@Component({
  host: { class: 'block' },
  selector: 'app-client-list',
  imports: [
    HasPermission,     
    ButtonModule, 
    ButtonModule,
    ClientForm,
    DialogModule,
    EmptyState,
    InputTextModule,
    MessageModule,
    PageHeader,
    StatusTag,
    TableModule,
    TagModule,
    TooltipModule,
  ],
  templateUrl: './client-list.html',
  styleUrl: './client-list.css',
})
export class ClientList {
  private readonly api = inject(ClientApi);
  private readonly notify = inject(NotificationService);
  private readonly confirmation = inject(ConfirmationService);

  readonly rows = signal<Client[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly filter = signal('');
  readonly dialogVisible = signal(false);
  readonly editing = signal<Client | null>(null);
  readonly resetKey = signal(0);

  /** `computed`: solo se recalcula si cambian `rows()` o `filter()`. */
  readonly visibleRows = computed(() =>
    filterRows(this.rows(), this.filter(), (c) => [c.name, c.documentNumber, c.email, c.phone]),
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

  openCreate(): void {
    this.editing.set(null);
    this.resetKey.update((key) => key + 1);
    this.dialogVisible.set(true);
  }

  openEdit(client: Client): void {
    this.editing.set(client);
    this.resetKey.update((key) => key + 1);
    this.dialogVisible.set(true);
  }

  /** `editing()` decide el verbo; al volver se recarga porque el backend es la verdad. */
  save(payload: ClientPayload): void {
    const current = this.editing();
    this.saving.set(true);
    const request = current
      ? this.api.update(current.id, payload)
      : this.api.create({ ...payload, status: 'active' });
    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogVisible.set(false);
        this.notify.success(current ? 'Cliente actualizado' : 'Cliente creado');
        this.load();
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.notify.error('No se pudo guardar', toApiMessage(error));
      },
    });
  }

  /** Baja lógica con confirmación: 204 y la fila queda inactiva. */
  remove(client: Client): void {
    this.confirmation.confirm({
      header: 'Dar de baja',
      message: `¿Dar de baja a ${client.name}? Dejará de operar y su historial se conserva.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Dar de baja',
      rejectLabel: 'Cancelar',
      accept: () =>
        this.api.remove(client.id).subscribe({
          next: () => {
            this.notify.warn('Cliente dado de baja');
            this.load();
          },
          error: (error: unknown) =>
            this.notify.error('No se pudo dar de baja', toApiMessage(error)),
        }),
    });
  }
}