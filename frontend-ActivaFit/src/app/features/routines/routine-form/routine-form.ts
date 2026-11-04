import { Component, effect, inject, input, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { Client } from '../../../core/models/client.model';
import { Routine, RoutinePayload } from '../../../core/models/routine.model';
import { Trainer } from '../../../core/models/trainer.model';

/** Alta y edición con el mismo formulario. No conoce la API: recibe y emite. */
@Component({
  host: { class: 'block' },
  selector: 'app-routine-form',
  imports: [
    ButtonModule,
    InputTextModule,
    MessageModule,
    ReactiveFormsModule,
    SelectModule,
    TextareaModule,
  ],
  templateUrl: './routine-form.html',
  styleUrl: './routine-form.css',
})
export class RoutineForm {
  /** Rutina a editar; `null` deja el formulario en modo alta. */
  readonly routine = input<Routine | null>(null);
  /** Solo entrenadores y clientes activos: los pasa el padre. */
  readonly trainers = input<Trainer[]>([]);
  readonly clients = input<Client[]>([]);
  readonly resetKey = input(0);
  readonly saving = input(false);

  readonly saved = output<RoutinePayload>();
  readonly cancelled = output<void>();

  private readonly fb = inject(NonNullableFormBuilder);

  readonly form = this.fb.group({
    trainerId: this.fb.control<number | null>(null, Validators.required),
    clientId: this.fb.control<number | null>(null, Validators.required),
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
    description: ['', [Validators.maxLength(255)]],
  });

  constructor() {
    effect(() => {
      const current = this.routine();
      this.resetKey();
      this.form.reset({
        trainerId: current?.trainerId ?? null,
        clientId: current?.clientId ?? null,
        name: current?.name ?? '',
        description: current?.description ?? '',
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
      trainerId: value.trainerId!,
      clientId: value.clientId!,
      name: value.name.trim(),
      description: value.description.trim() || null,
    });
  }
}
