import { Component, effect, inject, input, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TextareaModule } from 'primeng/textarea';
import { Plan, PlanPayload } from '../../../core/models/plan.model';

/** Alta y edición con el mismo formulario. No conoce la API: recibe y emite. */
@Component({
  host: { class: 'block' },
  selector: 'app-plan-form',
  imports: [ButtonModule, InputTextModule, MessageModule, ReactiveFormsModule, TextareaModule],
  templateUrl: './plan-form.html',
  styleUrl: './plan-form.css',
})
export class PlanForm {
  /** Plan a editar; `null` deja el formulario en modo alta. */
  readonly plan = input<Plan | null>(null);
  readonly resetKey = input(0);
  readonly saving = input(false);

  readonly saved = output<PlanPayload>();
  readonly cancelled = output<void>();

  private readonly fb = inject(NonNullableFormBuilder);

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(255)]],
  });

  constructor() {
    effect(() => {
      const current = this.plan();
      this.resetKey();
      this.form.reset({
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
      name: value.name.trim(),
      description: value.description.trim() || null,
    });
  }
}