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
import { Attendance, AttendancePayload } from '../../../core/models/attendance.model';
import { Membership } from '../../../core/models/membership.model';
import { NotificationService } from '../../../core/services/notification.service';
import { filterRows } from '../../../core/utils/filter-rows';
import { toApiMessage } from '../../../core/utils/to-api-message';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../../shared/ui/page-header/page-header';
import { MembershipApi } from '../../memberships/membership-api';
import { AttendanceApi } from '../attendance-api';
import { AttendanceForm } from '../attendance-form/attendance-form';

/** Dueña del estado del CRUD de asistencias. La tabla no tiene estado: el borrado es real. */
@Component({
  host: { class: 'block' },
  selector: 'app-attendance-list',
  imports: [
    HasPermission,
    AttendanceForm,
    ButtonModule,
    DatePipe,
    DialogModule,
    EmptyState,
    InputTextModule,
    MessageModule,
    PageHeader,
    TableModule,
    TagModule,
    TooltipModule,
  ],
  templateUrl: './attendance-list.html',
  styleUrl: './attendance-list.css',
})
export class AttendanceList {
  private readonly api = inject(AttendanceApi);
  private readonly membershipsApi = inject(MembershipApi);
  private readonly notify = inject(NotificationService);
  private readonly confirmation = inject(ConfirmationService);

  readonly rows = signal<Attendance[]>([]);
  readonly memberships = signal<Membership[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly filter = signal('');
  readonly dialogVisible = signal(false);
  readonly editing = signal<Attendance | null>(null);
  readonly resetKey = signal(0);

  /** Solo las membresías activas se ofrecen en el formulario. */
  readonly activeMemberships = computed(() =>
    this.memberships().filter((membership) => membership.status === 'active'),
  );

  private readonly membershipNames = computed(
    () =>
      new Map(
        this.memberships().map((membership) => [
          membership.id,
          `#${membership.id} · ${membership.clientName ?? 'Cliente #' + membership.client}`,
        ]),
      ),
  );

  readonly visibleRows = computed(() =>
    filterRows(this.rows(), this.filter(), (a) => [a.type, this.membershipLabel(a), a.id]),
  );

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      attendances: this.api.list(),
      memberships: this.membershipsApi.list(),
    }).subscribe({
      next: ({ attendances, memberships }) => {
        this.rows.set(attendances);
        this.memberships.set(memberships);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.rows.set([]);
        this.error.set(toApiMessage(error));
        this.loading.set(false);
      },
    });
  }

  membershipLabel(attendance: Attendance): string {
    return (
      this.membershipNames().get(attendance.membershipId) ??
      `Membresía #${attendance.membershipId}`
    );
  }

  openCreate(): void {
    this.editing.set(null);
    this.resetKey.update((key) => key + 1);
    this.dialogVisible.set(true);
  }

  openEdit(attendance: Attendance): void {
    this.editing.set(attendance);
    this.resetKey.update((key) => key + 1);
    this.dialogVisible.set(true);
  }

  save(payload: AttendancePayload): void {
    const current = this.editing();
    this.saving.set(true);
    const request = current ? this.api.update(current.id, payload) : this.api.create(payload);
    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogVisible.set(false);
        this.notify.success(current ? 'Asistencia actualizada' : 'Asistencia registrada');
        this.load();
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.notify.error('No se pudo guardar', toApiMessage(error));
      },
    });
  }

  /** Borrado real: elimina la fila y no se puede deshacer. */
  remove(attendance: Attendance): void {
    this.confirmation.confirm({
      header: 'Eliminar',
      message: `¿Eliminar la asistencia #${attendance.id}? Se borra la fila y no se puede deshacer.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      accept: () =>
        this.api.remove(attendance.id).subscribe({
          next: () => {
            this.notify.warn('Asistencia eliminada');
            this.load();
          },
          error: (error: unknown) => this.notify.error('No se pudo eliminar', toApiMessage(error)),
        }),
    });
  }
}