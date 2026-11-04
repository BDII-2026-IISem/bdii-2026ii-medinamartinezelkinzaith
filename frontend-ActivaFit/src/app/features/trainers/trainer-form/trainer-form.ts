import { Component, effect, inject, input, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { Trainer, TrainerPayload } from '../../../core/models/trainer.model';

/** Alta y edición con el mismo formulario. No conoce la API: recibe y emite. */
@Component({
  host: { class: 'block' },
  selector: 'app-trainer-form',
  imports: [ButtonModule, InputTextModule, MessageModule, ReactiveFormsModule],
  templateUrl: './trainer-form.html',
  styleUrl: './trainer-form.css',
})
export class TrainerForm {
  readonly trainer = input<Trainer | null>(null);
  readonly resetKey = input(0);
  readonly saving = input(false);

  readonly saved = output<TrainerPayload>();
  readonly cancelled = output<void>();

  private readonly fb = inject(NonNullableFormBuilder);

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
    specialty: ['', [Validators.maxLength(100)]],
    phone: ['', [Validators.pattern(/^[0-9+()\s-]{7,30}$/)]],
    email: ['', [Validators.email, Validators.maxLength(150)]],
  });

  constructor() {
    effect(() => {
      const current = this.trainer();
      this.resetKey();
      this.form.reset({
        name: current?.name ?? '',
        specialty: current?.specialty ?? '',
        phone: current?.phone ?? '',
        email: current?.email ?? '',
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
      name: value.name.trim(),
      specialty: value.specialty.trim() || null,
      phone: value.phone.trim() || null,
      email: value.email.trim() || null,
    });
  }
}