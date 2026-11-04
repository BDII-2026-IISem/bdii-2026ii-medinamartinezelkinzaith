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
import { Resource } from '../../../../core/models/resource.model';
import { ResourceRole, ResourceRolePayload } from '../../../../core/models/resource-role.model';
import { Role } from '../../../../core/models/role.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { filterRows } from '../../../../core/utils/filter-rows';
import { methodSeverity } from '../../../../core/utils/http-method';
import { toApiMessage } from '../../../../core/utils/to-api-message';
import { EmptyState } from '../../../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../../../shared/ui/page-header/page-header';
import { StatusTag } from '../../../../shared/ui/status-tag/status-tag';
import { ResourceApi } from '../../resources/resource-api';
import { RoleApi } from '../../roles/role-api';
import { ResourceRoleApi } from '../resource-role-api';

@Component({
  host: { class: 'block' },
  selector: 'app-resource-role-list',
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
  templateUrl: './resource-role-list.html',
  styleUrl: './resource-role-list.css',
})
export class ResourceRoleList {
  private readonly api = inject(ResourceRoleApi);
  private readonly resources = inject(ResourceApi);
  private readonly roles = inject(RoleApi);
  private readonly notify = inject(NotificationService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly fb = inject(NonNullableFormBuilder);

  readonly methodSeverity = methodSeverity;

  readonly rows = signal<ResourceRole[]>([]);
  readonly resourceCatalog = signal<Resource[]>([]);
  readonly roleCatalog = signal<Role[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly filter = signal('');
  readonly dialogVisible = signal(false);

  readonly form = this.fb.group({
    roleId: this.fb.control<number | null>(null, Validators.required),
    resourceId: this.fb.control<number | null>(null, Validators.required),
  });

  /** `MÉTODO ruta` para leer; el valor enviado es el `id`. */
  readonly resourceOptions = computed(() =>
    this.resourceCatalog().map((row) => ({ id: row.id, label: `${row.method} ${row.route}` })),
  );

  readonly visibleRows = computed(() =>
    filterRows(this.rows(), this.filter(), (row) => [
      this.roleLabel(row),
      this.resourceLabel(row.resourceId),
    ]),
  );

  constructor() {
    this.load();
    this.resources.list().subscribe({ next: (rows) => this.resourceCatalog.set(rows) });
    this.roles.list().subscribe({ next: (rows) => this.roleCatalog.set(rows) });
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

  resource(id: number): Resource | undefined {
    return this.resourceCatalog().find((row) => row.id === id);
  }

  resourceLabel(id: number): string {
    const row = this.resource(id);
    return row ? `${row.method} ${row.route}` : `#${id}`;
  }

  roleLabel(row: ResourceRole): string {
    return (
      row.roleName ?? this.roleCatalog().find((r) => r.id === row.roleId)?.name ?? `#${row.roleId}`
    );
  }

  openCreate(): void {
    this.form.reset({ roleId: null, resourceId: null });
    this.dialogVisible.set(true);
  }

  submit(): void {
    const value = this.form.getRawValue();
    if (!value.roleId || !value.resourceId) {
      this.form.markAllAsTouched();
      return;
    }
    this.save({ roleId: value.roleId, resourceId: value.resourceId, status: 'active' });
  }

  private save(payload: ResourceRolePayload): void {
    this.saving.set(true);
    this.api.create(payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogVisible.set(false);
        this.notify.success('Permiso concedido');
        this.load();
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.notify.error('No se pudo conceder', toApiMessage(error));
      },
    });
  }

  /** Retirar deja la fila inactiva: ese permiso deja de autorizar. */
  retire(row: ResourceRole): void {
    this.confirmation.confirm({
      header: 'Retirar permiso',
      message: `¿Retirar «${this.resourceLabel(row.resourceId)}» al rol «${this.roleLabel(row)}»? La fila queda inactiva y se puede reactivar.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Retirar',
      rejectLabel: 'Cancelar',
      accept: () =>
        this.api.remove(row.id).subscribe({
          next: () => {
            this.notify.warn('Permiso retirado');
            this.load();
          },
          error: (error: unknown) => this.notify.error('No se pudo retirar', toApiMessage(error)),
        }),
    });
  }

  /** Volver a conceder es cambiar `status`: el par rol-recurso es único. */
  reactivate(row: ResourceRole): void {
    this.api
      .update(row.id, { roleId: row.roleId, resourceId: row.resourceId, status: 'active' })
      .subscribe({
        next: () => {
          this.notify.success('Permiso reactivado');
          this.load();
        },
        error: (error: unknown) => this.notify.error('No se pudo reactivar', toApiMessage(error)),
      });
  }
}