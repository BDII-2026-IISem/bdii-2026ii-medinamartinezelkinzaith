import { Component, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { STATUS_OPTIONS, Status } from '../../../../core/models/api.model';
import { EffectivePermission } from '../../../../core/models/auth.model';
import { User, UserPayload } from '../../../../core/models/user.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { filterRows } from '../../../../core/utils/filter-rows';
import { methodSeverity } from '../../../../core/utils/http-method';
import { toApiMessage } from '../../../../core/utils/to-api-message';
import { EmptyState } from '../../../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../../../shared/ui/page-header/page-header';
import { StatusTag } from '../../../../shared/ui/status-tag/status-tag';
import { UserApi } from '../user-api';

@Component({
  host: { class: 'block' },
  selector: 'app-user-list',
  imports: [
    ButtonModule,
    DialogModule,
    EmptyState,
    InputTextModule,
    MessageModule,
    PageHeader,
    PasswordModule,
    ReactiveFormsModule,
    SelectModule,
    StatusTag,
    TableModule,
    TagModule,
    TooltipModule,
  ],
  templateUrl: './user-list.html',
  styleUrl: './user-list.css',
})
export class UserList {
  private readonly api = inject(UserApi);
  private readonly notify = inject(NotificationService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly fb = inject(NonNullableFormBuilder);

  readonly statusOptions = STATUS_OPTIONS;
  readonly methodSeverity = methodSeverity;

  readonly rows = signal<User[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly filter = signal('');
  readonly dialogVisible = signal(false);
  readonly editing = signal<User | null>(null);
  readonly permissions = signal<EffectivePermission[]>([]);
  readonly permissionsUser = signal<User | null>(null);
  readonly permissionsLoading = signal(false);

  readonly form = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    firstName: ['', [Validators.maxLength(150)]],
    lastName: ['', [Validators.maxLength(150)]],
    status: ['active' as Status, [Validators.required]],
  });

  /** `computed`: escribir en el buscador no genera peticiones. */
  readonly visibleRows = computed(() =>
    filterRows(this.rows(), this.filter(), (row) => [row.username, row.email, row.firstName, row.lastName]),
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
    this.resetForm(null);
    this.dialogVisible.set(true);
  }

  openEdit(row: User): void {
    this.editing.set(row);
    this.resetForm(row);
    this.dialogVisible.set(true);
  }

  /** En edición la contraseña se deshabilita: el `PATCH` no la lleva. */
  private resetForm(row: User | null): void {
    this.form.reset({
      username: row?.username ?? '',
      email: row?.email ?? '',
      password: '',
      firstName: row?.firstName ?? '',
      lastName: row?.lastName ?? '',
      status: row?.status ?? 'active',
    });
    if (row) {
      this.form.controls.password.disable();
    } else {
      this.form.controls.password.enable();
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const payload: UserPayload = {
      username: value.username.trim(),
      email: value.email.trim(),
      firstName: value.firstName.trim(),
      lastName: value.lastName.trim(),
      status: value.status,
    };
    if (!this.editing()) {
      payload.password = value.password;
    }
    this.save(payload);
  }

  /** Alta o edición según `editing()`: las otras pantallas repiten este método. */
  private save(payload: UserPayload): void {
    const current = this.editing();
    this.saving.set(true);
    const request = current ? this.api.update(current.id, payload) : this.api.create(payload);
    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogVisible.set(false);
        this.notify.success(current ? 'Usuario actualizado' : 'Usuario creado');
        this.load();
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.notify.error('No se pudo guardar', toApiMessage(error));
      },
    });
  }

  deactivate(row: User): void {
    this.confirmation.confirm({
      header: 'Desactivar usuario',
      message: `¿Desactivar a «${row.username}»? No podrá iniciar sesión; la fila se conserva.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Desactivar',
      rejectLabel: 'Cancelar',
      accept: () =>
        this.api.remove(row.id).subscribe({
          next: () => {
            this.notify.warn('Usuario desactivado');
            this.load();
          },
          error: (error: unknown) => this.notify.error('No se pudo desactivar', toApiMessage(error)),
        }),
    });
  }

  /** La forma más rápida de diagnosticar un 403: qué filas sostienen a este usuario. */
  openPermissions(row: User): void {
    this.permissionsUser.set(row);
    this.permissions.set([]);
    this.permissionsLoading.set(true);
    this.api.permissions(row.id).subscribe({
      next: (rows) => {
        this.permissions.set(rows);
        this.permissionsLoading.set(false);
      },
      error: (error: unknown) => {
        this.permissionsLoading.set(false);
        this.notify.error('No se pudieron leer los permisos', toApiMessage(error));
      },
    });
  }
}