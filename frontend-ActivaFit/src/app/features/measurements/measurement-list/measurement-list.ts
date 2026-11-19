import { DatePipe } from '@angular/common';
import { HasPermission } from '../../../shared/directives/has-permission';
import { Component, computed, inject, signal } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { forkJoin } from 'rxjs';
import { Client } from '../../../core/models/client.model';
import { Measurement, MeasurementPayload } from '../../../core/models/measurement.model';
import { NotificationService } from '../../../core/services/notification.service';
import { filterRows } from '../../../core/utils/filter-rows';
import { toApiMessage } from '../../../core/utils/to-api-message';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../../shared/ui/page-header/page-header';
import { ClientApi } from '../../clients/client-api';
import { MeasurementApi } from '../measurement-api';
import { MeasurementForm } from '../measurement-form/measurement-form';

/** Dueña del estado del CRUD de medidas. La tabla no tiene estado: el borrado es real. */
@Component({
  host: { class: 'block' },
  selector: 'app-measurement-list',
  imports: [
    HasPermission,
    ButtonModule,
    DatePipe,
    DialogModule,
    EmptyState,
    InputTextModule,
    MeasurementForm,
    MessageModule,
    PageHeader,
    TableModule,
    TagModule,
    TooltipModule,
  ],
  templateUrl: './measurement-list.html',
  styleUrl: './measurement-list.css',
})
export class MeasurementList {
  private readonly api = inject(MeasurementApi);
  private readonly clientsApi = inject(ClientApi);
  private readonly notify = inject(NotificationService);
  private readonly confirmation = inject(ConfirmationService);

  readonly rows = signal<Measurement[]>([]);
  readonly clients = signal<Client[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly filter = signal('');
  readonly dialogVisible = signal(false);
  readonly editing = signal<Measurement | null>(null);
  readonly resetKey = signal(0);

  private readonly clientNames = computed(
    () => new Map(this.clients().map((client) => [client.id, client.name])),
  );

  readonly visibleRows = computed(() =>
    filterRows(this.rows(), this.filter(), (m) => [this.clientLabel(m)]),
  );

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      measurements: this.api.list(),
      clients: this.clientsApi.list('active'),
    }).subscribe({
      next: ({ measurements, clients }) => {
        this.rows.set(measurements);
        this.clients.set(clients);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.rows.set([]);
        this.error.set(toApiMessage(error));
        this.loading.set(false);
      },
    });
  }

  clientLabel(measurement: Measurement): string {
    return (
      measurement.clientName ??
      this.clientNames().get(measurement.clientId) ??
      `Cliente #${measurement.clientId}`
    );
  }


  openCreate(): void {
    this.editing.set(null);
    this.resetKey.update((key) => key + 1);
    this.dialogVisible.set(true);
  }

  openEdit(measurement: Measurement): void {
    this.editing.set(measurement);
    this.resetKey.update((key) => key + 1);
    this.dialogVisible.set(true);
  }

  /** No hay `status`: el alta envía solo el cuerpo. */
  save(payload: MeasurementPayload): void {
    const current = this.editing();
    this.saving.set(true);
    const request = current ? this.api.update(current.id, payload) : this.api.create(payload);
    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogVisible.set(false);
        this.notify.success(current ? 'Medida actualizada' : 'Medida registrada');
        this.load();
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.notify.error('No se pudo guardar', toApiMessage(error));
      },
    });
  }

  /** Borrado real: elimina la fila y no se puede deshacer. */
  remove(measurement: Measurement): void {
    this.confirmation.confirm({
      header: 'Eliminar',
      message: `¿Eliminar la medida #${measurement.id} de ${this.clientLabel(measurement)}? Se borra la fila y no se puede deshacer.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      accept: () =>
        this.api.remove(measurement.id).subscribe({
          next: () => {
            this.notify.warn('Medida eliminada');
            this.load();
          },
          error: (error: unknown) => this.notify.error('No se pudo eliminar', toApiMessage(error)),
        }),
    });
  }
}