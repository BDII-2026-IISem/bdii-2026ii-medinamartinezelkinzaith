import { Component, computed, effect, inject, input, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { Attendance, AttendancePayload } from '../../../core/models/attendance.model';
import { Membership } from '../../../core/models/membership.model';
import { toDateOnly, toIsoWithOffset } from '../../memberships/membership-date';

/** Fecha ISO a `YYYY-MM-DDTHH:mm` en hora local, para `datetime-local`. */
function toLocalInput(iso: string): string {
  const date = new Date(iso);
  const pad = (n: number): string => String(n).padStart(2, '0');
  return `${toDateOnly(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Alta y edición de una asistencia. No conoce la API: recibe y emite. */
@Component({
  host: { class: 'block' },
  selector: 'app-attendance-form',
  imports: [ButtonModule, InputTextModule, MessageModule, ReactiveFormsModule, SelectModule],
  templateUrl: './attendance-form.html',
  styleUrl: './attendance-form.css',
})
export class AttendanceForm {
  readonly attendance = input<Attendance | null>(null);
  /** Solo membresías activas: las filtra el padre. */
  readonly memberships = input<Membership[]>([]);
  readonly resetKey = input(0);
  readonly saving = input(false);

  readonly saved = output<AttendancePayload>();
  readonly cancelled = output<void>();

  readonly types = [
    { label: 'Entrada', value: 'entrada' },
    { label: 'Salida', value: 'salida' },
  ];

  readonly options = computed(() =>
    this.memberships().map((membership) => ({
      id: membership.id,
      label: `#${membership.id} · ${membership.clientName ?? 'Cliente #' + membership.client} · ${membership.planName ?? 'Plan #' + membership.plan}`,
    })),
  );

  private readonly fb = inject(NonNullableFormBuilder);

  readonly form = this.fb.group({
    membershipId: this.fb.control<number | null>(null, Validators.required),
    type: ['', [Validators.required, Validators.maxLength(20)]],
    attendanceDate: [''],
  });

  constructor() {
    effect(() => {
      const current = this.attendance();
      this.resetKey();
      this.form.reset({
        membershipId: current?.membershipId ?? null,
        type: current?.type ?? '',
        attendanceDate: current ? toLocalInput(current.attendanceDate) : '',
      });
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.saved.emit({
      membershipId: value.membershipId!,
      type: value.type,
      ...(value.attendanceDate
        ? { attendanceDate: toIsoWithOffset(new Date(value.attendanceDate)) }
        : {}),
    });
  }
}