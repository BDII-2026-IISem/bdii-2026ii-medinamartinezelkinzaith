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
import { Trainer, TrainerPayload } from '../../../core/models/trainer.model';
import { NotificationService } from '../../../core/services/notification.service';
import { filterRows } from '../../../core/utils/filter-rows';
import { toApiMessage } from '../../../core/utils/to-api-message';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../../shared/ui/page-header/page-header';
import { StatusTag } from '../../../shared/ui/status-tag/status-tag';
import { TrainerApi } from '../trainer-api';
import { TrainerForm } from '../trainer-form/trainer-form';

/** Dueña del estado del CRUD de entrenadores. */
@Component({
  host: { class: 'block' },
  selector: 'app-trainer-list',
  imports: [
    HasPermission,
    ButtonModule,
    DialogModule,
    EmptyState,
    InputTextModule,
    MessageModule,
    PageHeader,
    StatusTag,
    TableModule,
    TagModule,
    TooltipModule,
    TrainerForm,
  ],
  templateUrl: './trainer-list.html',
  styleUrl: './trainer-list.css',
})
export class TrainerList {
  private readonly api = inject(TrainerApi);
  private readonly notify = inject(NotificationService);
  private readonly confirmation = inject(ConfirmationService);

  readonly rows = signal<Trainer[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly filter = signal('');
  readonly dialogVisible = signal(false);
  readonly editing = signal<Trainer | null>(null);
  readonly resetKey = signal(0);

  readonly visibleRows = computed(() =>
    filterRows(this.rows(), this.filter(), (t) => [t.name, t.specialty, t.email, t.phone]),
  );

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.list('active').subscribe({
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

  openEdit(trainer: Trainer): void {
    this.editing.set(trainer);
    this.resetKey.update((key) => key + 1);
    this.dialogVisible.set(true);
  }

  save(payload: TrainerPayload): void {
    const current = this.editing();
    this.saving.set(true);
    const request = current
      ? this.api.update(current.id, payload)
      : this.api.create({ ...payload, status: 'active' });
    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogVisible.set(false);
        this.notify.success(current ? 'Entrenador actualizado' : 'Entrenador creado');
        this.load();
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.notify.error('No se pudo guardar', toApiMessage(error));
      },
    });
  }

  deactivate(trainer: Trainer): void {
    this.confirmation.confirm({
      header: 'Desactivar',
      message: `¿Desactivar a «${trainer.name}»? Sus rutinas y medidas se conservan.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Desactivar',
      rejectLabel: 'Cancelar',
      accept: () =>
        this.api.remove(trainer.id).subscribe({
          next: () => {
            this.notify.warn('Entrenador desactivado');
            this.load();
          },
          error: (error: unknown) =>
            this.notify.error('No se pudo desactivar', toApiMessage(error)),
        }),
    });
  }
}