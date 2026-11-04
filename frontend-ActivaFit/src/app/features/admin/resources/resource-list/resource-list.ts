import { Component, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { HttpMethod, STATUS_OPTIONS, Status } from '../../../../core/models/api.model';
import { Resource, ResourcePayload } from '../../../../core/models/resource.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { filterRows } from '../../../../core/utils/filter-rows';
import { HTTP_METHODS, methodSeverity } from '../../../../core/utils/http-method';
import { toApiMessage } from '../../../../core/utils/to-api-message';
import { EmptyState } from '../../../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../../../shared/ui/page-header/page-header';
import { StatusTag } from '../../../../shared/ui/status-tag/status-tag';
import { ResourceApi } from '../resource-api';

@Component({
  host: { class: 'block' },
  selector: 'app-resource-list',
  imports: [
    ButtonModule,
    DialogModule,
    EmptyState,
    InputTextModule,
    MessageModule,
    PageHeader,
    ReactiveFormsModule,
    SelectModule,
    StatusTag,
    TableModule,
    TagModule,
    TooltipModule,
  ],
  templateUrl: './resource-list.html',
  styleUrl: './resource-list.css',
})
export class ResourceList {
  private readonly api = inject(ResourceApi);
  private readonly notify = inject(NotificationService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly fb = inject(NonNullableFormBuilder);

  readonly statusOptions = STATUS_OPTIONS;
  readonly methods = HTTP_METHODS;
  readonly methodSeverity = methodSeverity;

  readonly rows = signal<Resource[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly filter = signal('');
  readonly dialogVisible = signal(false);
  readonly editing = signal<Resource | null>(null);

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    method: ['GET' as HttpMethod, [Validators.required]],
    route: ['', [Validators.required, Validators.maxLength(255), Validators.pattern(/^api\//)]],
    status: ['active' as Status, [Validators.required]],
  });

  readonly visibleRows = computed(() =>
    filterRows(this.rows(), this.filter(), (row) => [row.name, row.method, row.route]),
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
    this.form.reset({ name: '', method: 'GET', route: '', status: 'active' });
    this.dialogVisible.set(true);
  }

  openEdit(row: Resource): void {
    this.editing.set(row);
    this.form.reset({
      name: row.name,
      method: row.method,
      route: row.route,
      status: row.status,
    });
    this.dialogVisible.set(true);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.save({
      name: value.name.trim(),
      method: value.method,
      route: value.route.trim(),
      status: value.status,
    });
  }

  private save(payload: ResourcePayload): void {
    const current = this.editing();
    this.saving.set(true);
    const request = current ? this.api.update(current.id, payload) : this.api.create(payload);
    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogVisible.set(false);
        this.notify.success(current ? 'Recurso actualizado' : 'Recurso creado');
        this.load();
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.notify.error('No se pudo guardar', toApiMessage(error));
      },
    });
  }

  deactivate(row: Resource): void {
    this.confirmation.confirm({
      header: 'Desactivar recurso',
      message: `¿Desactivar «${row.method} ${row.route}»? Nadie podrá ejecutarlo hasta reactivarlo.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Desactivar',
      rejectLabel: 'Cancelar',
      accept: () =>
        this.api.remove(row.id).subscribe({
          next: () => {
            this.notify.warn('Recurso desactivado');
            this.load();
          },
          error: (error: unknown) => this.notify.error('No se pudo desactivar', toApiMessage(error)),
        }),
    });
  }
}