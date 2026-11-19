import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { Observable, concatMap, forkJoin, from, toArray } from 'rxjs';
import { Resource } from '../../../../core/models/resource.model';
import { ResourceRole } from '../../../../core/models/resource-role.model';
import { Role } from '../../../../core/models/role.model';
import { RoleUser } from '../../../../core/models/role-user.model';
import { User } from '../../../../core/models/user.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { SessionStore } from '../../../../core/services/session-store';
import { filterRows } from '../../../../core/utils/filter-rows';
import { toApiMessage } from '../../../../core/utils/to-api-message';
import { ResourceRoleApi } from '../../resource-roles/resource-role-api';
import { ResourceApi } from '../../resources/resource-api';
import { RoleUserApi } from '../../role-users/role-user-api';
import { RoleApi } from '../../roles/role-api';
import { UserApi } from '../../users/user-api';
import {
  ACTIONS,
  Action,
  CellState,
  ENTITIES,
  buildCells,
  cellState,
  controlledIds,
  planChanges,
  toggleCell,
} from '../rbac-matrix';

@Component({
  host: { class: 'block' },
  selector: 'app-role-permissions',
  imports: [
    ButtonModule,
    ChipModule,
    DialogModule,
    InputTextModule,
    MessageModule,
    ReactiveFormsModule,
    SelectModule,
  ],
  templateUrl: './role-permissions.html',
  styleUrl: './role-permissions.css',
})
export class RolePermissions {
  private readonly roleApi = inject(RoleApi);
  private readonly resourceApi = inject(ResourceApi);
  private readonly grantApi = inject(ResourceRoleApi);
  private readonly userApi = inject(UserApi);
  private readonly roleUserApi = inject(RoleUserApi);
  private readonly notify = inject(NotificationService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly session = inject(SessionStore);

  readonly entities = ENTITIES;
  readonly actions = ACTIONS;
  readonly actionNames: Record<Action, string> = {
    C: 'Crear',
    R: 'Leer',
    U: 'Actualizar',
    D: 'Eliminar',
  };

  readonly roles = signal<Role[]>([]);
  readonly resources = signal<Resource[]>([]);
  readonly grants = signal<ResourceRole[]>([]);
  readonly users = signal<User[]>([]);
  readonly roleUsers = signal<RoleUser[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly search = signal('');
  readonly selectedId = signal<number | null>(null);
  /** Recursos que el borrador quiere concedidos al rol seleccionado. */
  readonly draft = signal<ReadonlySet<number>>(new Set<number>());
  readonly newRoleVisible = signal(false);

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(255)]],
  });
  readonly newForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(255)]],
  });
  readonly assignControl = new FormControl<number | null>(null);

  readonly cells = computed(() => buildCells(this.resources()));
  readonly controlled = computed(() => controlledIds(this.cells()));
  readonly selected = computed(() => this.roles().find((r) => r.id === this.selectedId()) ?? null);
  readonly visibleRoles = computed(() =>
    filterRows(
      this.roles().filter((role) => role.status === 'active'),
      this.search(),
      (role) => [role.name, role.description],
    ),
  );

  /** Todas las filas de concesión del rol, activas o no: sirven para reactivar. */
  private readonly roleGrants = computed(() =>
    this.grants().filter((grant) => grant.roleId === this.selectedId()),
  );
  /** Lo que el servidor tiene concedido hoy al rol. */
  readonly current = computed(
    () => new Set(this.roleGrants().filter((g) => g.status === 'active').map((g) => g.resourceId)),
  );

  readonly assignedUsers = computed(() =>
    this.roleUsers().filter((ru) => ru.roleId === this.selectedId() && ru.status === 'active'),
  );
  readonly availableUsers = computed(() => {
    const assigned = new Set(this.assignedUsers().map((ru) => ru.userId));
    return this.users().filter((user) => user.status === 'active' && !assigned.has(user.id));
  });
  /** Un rol que uso en mi sesión: no se elimina y se confirma al quitarle permisos. */
  readonly isOwnRole = computed(() => {
    const role = this.selected();
    return !!role && this.session.roles().includes(role.name);
  });

  constructor() {
    this.load();
  }

  load(selectId?: number): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      roles: this.roleApi.list(),
      resources: this.resourceApi.list(),
      grants: this.grantApi.list(),
      users: this.userApi.list(),
      roleUsers: this.roleUserApi.list(),
    }).subscribe({
      next: ({ roles, resources, grants, users, roleUsers }) => {
        this.roles.set(roles);
        this.resources.set(resources);
        this.grants.set(grants);
        this.users.set(users);
        this.roleUsers.set(roleUsers);
        this.loading.set(false);
        const active = roles.filter((role) => role.status === 'active');
        const wanted = selectId ?? this.selectedId();
        const target = active.find((role) => role.id === wanted) ?? active[0];
        if (target) {
          this.select(target.id);
        } else {
          this.selectedId.set(null);
        }
      },
      error: (error: unknown) => {
        this.loading.set(false);
        this.error.set(toApiMessage(error));
      },
    });
  }

  select(id: number): void {
    const role = this.roles().find((r) => r.id === id);
    if (!role) return;
    this.selectedId.set(id);
    this.form.reset({ name: role.name, description: role.description ?? '' });
    this.draft.set(new Set(this.current()));
    this.assignControl.reset();
  }

  state(entityKey: string, action: Action): CellState {
    return cellState(this.cells()[entityKey][action], this.draft());
  }

  toggle(entityKey: string, action: Action): void {
    this.draft.set(toggleCell(this.cells()[entityKey][action], this.draft()));
  }

  markAll(): void {
    this.draft.set(new Set([...this.draft(), ...this.controlled()]));
  }

  clearAll(): void {
    const controlled = this.controlled();
    this.draft.set(new Set([...this.draft()].filter((id) => !controlled.has(id))));
  }

  /** Guarda los datos del rol y la diferencia de la matriz, en orden, una petición a la vez. */
  save(): void {
    const role = this.selected();
    if (!role) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const plan = planChanges(this.current(), this.draft(), this.controlled());
    const byResource = new Map(this.roleGrants().map((grant) => [grant.resourceId, grant]));
    const requests: Observable<unknown>[] = [];

    if (value.name.trim() !== role.name || (value.description.trim() || null) !== role.description) {
      requests.push(
        this.roleApi.update(role.id, {
          name: value.name.trim(),
          description: value.description.trim() || null,
          status: role.status,
        }),
      );
    }
    for (const resourceId of plan.grant) {
      const row = byResource.get(resourceId);
      requests.push(
        row
          ? this.grantApi.update(row.id, { roleId: role.id, resourceId, status: 'active' })
          : this.grantApi.create({ roleId: role.id, resourceId, status: 'active' }),
      );
    }
    for (const resourceId of plan.revoke) {
      const row = byResource.get(resourceId);
      if (row) requests.push(this.grantApi.remove(row.id));
    }

    if (requests.length === 0) {
      this.notify.info('Sin cambios', 'No hay nada que guardar.');
      return;
    }
    if (this.isOwnRole() && plan.revoke.length > 0) {
      this.confirmation.confirm({
        header: 'Editas un rol que usas',
        message: 'Estás quitando permisos a un rol de tu propia sesión. Podrías perder acceso a pantallas. ¿Continuar?',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Guardar',
        rejectLabel: 'Cancelar',
        accept: () => this.run(requests),
      });
      return;
    }
    this.run(requests);
  }

  private run(requests: Observable<unknown>[]): void {
    this.saving.set(true);
    from(requests)
      .pipe(
        concatMap((request) => request),
        toArray(),
      )
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.notify.success('Cambios guardados', `${requests.length} operaciones aplicadas.`);
          this.load();
        },
        error: (error: unknown) => {
          this.saving.set(false);
          this.notify.error('No se pudo guardar', toApiMessage(error));
          this.load();
        },
      });
  }

  openNewRole(): void {
    this.newForm.reset({ name: '', description: '' });
    this.newRoleVisible.set(true);
  }

  createRole(): void {
    if (this.newForm.invalid) {
      this.newForm.markAllAsTouched();
      return;
    }
    const value = this.newForm.getRawValue();
    this.roleApi
      .create({ name: value.name.trim(), description: value.description.trim() || null, status: 'active' })
      .subscribe({
        next: (created) => {
          this.newRoleVisible.set(false);
          this.notify.success('Rol creado');
          this.load(created.id);
        },
        error: (error: unknown) => this.notify.error('No se pudo crear', toApiMessage(error)),
      });
  }

  removeRole(role: Role): void {
    this.confirmation.confirm({
      header: 'Eliminar rol',
      message: `¿Eliminar el rol «${role.name}»? Queda inactivo y sus concesiones dejan de autorizar.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      accept: () =>
        this.roleApi.remove(role.id).subscribe({
          next: () => {
            this.notify.warn('Rol eliminado');
            this.load();
          },
          error: (error: unknown) => this.notify.error('No se pudo eliminar', toApiMessage(error)),
        }),
    });
  }

  userLabel(ru: RoleUser): string {
    return this.users().find((u) => u.id === ru.userId)?.email ?? ru.username ?? `#${ru.userId}`;
  }

  assign(): void {
    const userId = this.assignControl.value;
    const role = this.selected();
    if (userId === null || !role) return;
    const existing = this.roleUsers().find((ru) => ru.roleId === role.id && ru.userId === userId);
    const request = existing
      ? this.roleUserApi.update(existing.id, { userId, roleId: role.id, status: 'active' })
      : this.roleUserApi.create({ userId, roleId: role.id, status: 'active' });
    request.subscribe({
      next: () => {
        this.assignControl.reset();
        this.notify.success('Rol asignado');
        this.reloadAssignments();
      },
      error: (error: unknown) => this.notify.error('No se pudo asignar', toApiMessage(error)),
    });
  }

  unassign(ru: RoleUser): void {
    if (ru.userId === this.session.user()?.id) {
      this.notify.warn('No permitido', 'No puedes quitarte tu propio rol desde aquí.');
      return;
    }
    this.roleUserApi.remove(ru.id).subscribe({
      next: () => {
        this.notify.warn('Rol retirado');
        this.reloadAssignments();
      },
      error: (error: unknown) => this.notify.error('No se pudo retirar', toApiMessage(error)),
    });
  }

  /** Solo recarga las asignaciones, para no perder la matriz que se está editando. */
  private reloadAssignments(): void {
    this.roleUserApi.list().subscribe({ next: (rows) => this.roleUsers.set(rows) });
  }
}