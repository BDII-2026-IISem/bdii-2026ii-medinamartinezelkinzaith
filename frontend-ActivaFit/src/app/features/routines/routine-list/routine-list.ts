import { Component, computed, inject, signal } from '@angular/core';
import { HasPermission } from '../../../shared/directives/has-permission';
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
import { Routine, RoutinePayload } from '../../../core/models/routine.model';
import { Trainer } from '../../../core/models/trainer.model';
import { NotificationService } from '../../../core/services/notification.service';
import { filterRows } from '../../../core/utils/filter-rows';
import { toApiMessage } from '../../../core/utils/to-api-message';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../../shared/ui/page-header/page-header';
import { StatusTag } from '../../../shared/ui/status-tag/status-tag';
import { ClientApi } from '../../clients/client-api';
import { TrainerApi } from '../../trainers/trainer-api';
import { RoutineApi } from '../routine-api';
import { RoutineForm } from '../routine-form/routine-form';

/** Dueña del estado del CRUD de rutinas. */
@Component({
  host: { class: 'block' },
  selector: 'app-routine-list',
  imports: [
    HasPermission,
    ButtonModule,
    DialogModule,
    EmptyState,
    InputTextModule,
    MessageModule,
    PageHeader,
    RoutineForm,
    StatusTag,
    TableModule,
    TagModule,
    TooltipModule,
  ],
  templateUrl: './routine-list.html',
  styleUrl: './routine-list.css',
})
export class RoutineList {
  private readonly api = inject(RoutineApi);
  private readonly trainersApi = inject(TrainerApi);
  private readonly clientsApi = inject(ClientApi);
  private readonly notify = inject(NotificationService);
  private readonly confirmation = inject(ConfirmationService);

  readonly rows = signal<Routine[]>([]);
  readonly trainers = signal<Trainer[]>([]);
  readonly clients = signal<Client[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly filter = signal('');
  readonly dialogVisible = signal(false);
  readonly editing = signal<Routine | null>(null);
  readonly resetKey = signal(0);

  private readonly trainerNames = computed(
    () => new Map(this.trainers().map((trainer) => [trainer.id, trainer.name])),
  );
  private readonly clientNames = computed(
    () => new Map(this.clients().map((client) => [client.id, client.name])),
  );

  readonly visibleRows = computed(() =>
    filterRows(this.rows(), this.filter(), (r) => [
      r.name,
      r.description,
      this.trainerLabel(r),
      this.clientLabel(r),
    ]),
  );

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      routines: this.api.list('active'),
      trainers: this.trainersApi.list('active'),
      clients: this.clientsApi.list('active'),
    }).subscribe({
      next: ({ routines, trainers, clients }) => {
        this.rows.set(routines);
        this.trainers.set(trainers);
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

  trainerLabel(routine: Routine): string {
    return (
      routine.trainerName ??
      this.trainerNames().get(routine.trainerId) ??
      `Entrenador #${routine.trainerId}`
    );
  }

  clientLabel(routine: Routine): string {
    return (
      routine.clientName ?? this.clientNames().get(routine.clientId) ?? `Cliente #${routine.clientId}`
    );
  }

  openCreate(): void {
    this.editing.set(null);
    this.resetKey.update((key) => key + 1);
    this.dialogVisible.set(true);
  }

  openEdit(routine: Routine): void {
    this.editing.set(routine);
    this.resetKey.update((key) => key + 1);
    this.dialogVisible.set(true);
  }

  save(payload: RoutinePayload): void {
    const current = this.editing();
    this.saving.set(true);
    const request = current
      ? this.api.update(current.id, payload)
      : this.api.create({ ...payload, status: 'active' });
    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogVisible.set(false);
        this.notify.success(current ? 'Rutina actualizada' : 'Rutina creada');
        this.load();
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.notify.error('No se pudo guardar', toApiMessage(error));
      },
    });
  }

  /** Baja lógica con confirmación: 204 y la fila sale del listado activo. */
  deactivate(routine: Routine): void {
    this.confirmation.confirm({
      header: 'Desactivar',
      message: `¿Desactivar la rutina «${routine.name}»? Sus ejercicios asignados se conservan.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Desactivar',
      rejectLabel: 'Cancelar',
      accept: () =>
        this.api.remove(routine.id).subscribe({
          next: () => {
            this.notify.warn('Rutina desactivada');
            this.load();
          },
          error: (error: unknown) =>
            this.notify.error('No se pudo desactivar', toApiMessage(error)),
        }),
    });
  }
}
