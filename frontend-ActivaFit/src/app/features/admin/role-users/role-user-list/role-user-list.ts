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
import { Role } from '../../../../core/models/role.model';
import { RoleUser, RoleUserPayload } from '../../../../core/models/role-user.model';
import { User } from '../../../../core/models/user.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { filterRows } from '../../../../core/utils/filter-rows';
import { toApiMessage } from '../../../../core/utils/to-api-message';
import { EmptyState } from '../../../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../../../shared/ui/page-header/page-header';
import { StatusTag } from '../../../../shared/ui/status-tag/status-tag';
import { RoleApi } from '../../roles/role-api';
import { UserApi } from '../../users/user-api';
import { RoleUserApi } from '../role-user-api';

@Component({
  host: { class: 'block' },
  selector: 'app-role-user-list',
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
  templateUrl: './role-user-list.html',
  styleUrl: './role-user-list.css',
})
export class RoleUserList {
  private readonly api = inject(RoleUserApi);
  private readonly users = inject(UserApi);
  private readonly roles = inject(RoleApi);
  private readonly notify = inject(NotificationService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly fb = inject(NonNullableFormBuilder);

  readonly rows = signal<RoleUser[]>([]);
  readonly userCatalog = signal<User[]>([]);
  readonly roleCatalog = signal<Role[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly filter = signal('');
  readonly dialogVisible = signal(false);

  readonly form = this.fb.group({
    userId: this.fb.control<number | null>(null, Validators.required),
    roleId: this.fb.control<number | null>(null, Validators.required),
  });

  readonly visibleRows = computed(() =>
    filterRows(this.rows(), this.filter(), (row) => [this.userLabel(row), this.roleLabel(row)]),
  );

  constructor() {
    this.load();
    this.users.list().subscribe({ next: (rows) => this.userCatalog.set(rows) });
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

  userLabel(row: RoleUser): string {
    return (
      row.username ?? this.userCatalog().find((u) => u.id === row.userId)?.username ?? `#${row.userId}`
    );
  }

  roleLabel(row: RoleUser): string {
    return (
      row.roleName ?? this.roleCatalog().find((r) => r.id === row.roleId)?.name ?? `#${row.roleId}`
    );
  }

  openCreate(): void {
    this.form.reset({ userId: null, roleId: null });
    this.dialogVisible.set(true);
  }

  submit(): void {
    const value = this.form.getRawValue();
    if (!value.userId || !value.roleId) {
      this.form.markAllAsTouched();
      return;
    }
    this.save({ userId: value.userId, roleId: value.roleId, status: 'active' });
  }

  private save(payload: RoleUserPayload): void {
    this.saving.set(true);
    this.api.create(payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogVisible.set(false);
        this.notify.success('Rol asignado');
        this.load();
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.notify.error('No se pudo asignar', toApiMessage(error));
      },
    });
  }

  /** Retirar deja la fila inactiva; no la borra. */
  retire(row: RoleUser): void {
    this.confirmation.confirm({
      header: 'Retirar rol',
      message: `¿Retirar el rol «${this.roleLabel(row)}» a «${this.userLabel(row)}»? La fila queda inactiva y se puede reactivar.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Retirar',
      rejectLabel: 'Cancelar',
      accept: () =>
        this.api.remove(row.id).subscribe({
          next: () => {
            this.notify.warn('Rol retirado');
            this.load();
          },
          error: (error: unknown) => this.notify.error('No se pudo retirar', toApiMessage(error)),
        }),
    });
  }

  /** Retirar y volver a conceder es cambiar `status`: no se inserta otra fila. */
  reactivate(row: RoleUser): void {
    this.api.update(row.id, { userId: row.userId, roleId: row.roleId, status: 'active' }).subscribe({
      next: () => {
        this.notify.success('Rol reactivado');
        this.load();
      },
      error: (error: unknown) => this.notify.error('No se pudo reactivar', toApiMessage(error)),
    });
  }
}