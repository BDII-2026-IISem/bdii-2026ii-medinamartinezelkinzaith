import { Component, effect, inject, input, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TextareaModule } from 'primeng/textarea';
import { Exercise, ExercisePayload } from '../../../core/models/exercise.model';

/** Alta y edición con el mismo formulario. No conoce la API: recibe y emite. */
@Component({
  host: { class: 'block' },
  selector: 'app-exercise-form',
  imports: [ButtonModule, InputTextModule, MessageModule, ReactiveFormsModule, TextareaModule],
  templateUrl: './exercise-form.html',
  styleUrl: './exercise-form.css',
})
export class ExerciseForm {
  readonly exercise = input<Exercise | null>(null);
  readonly resetKey = input(0);
  readonly saving = input(false);

  readonly saved = output<ExercisePayload>();
  readonly cancelled = output<void>();

  private readonly fb = inject(NonNullableFormBuilder);

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
    muscleGroup: ['', [Validators.required, Validators.maxLength(50)]],
    description: ['', [Validators.maxLength(255)]],
  });

  constructor() {
    effect(() => {
      const current = this.exercise();
      this.resetKey();
      this.form.reset({
        name: current?.name ?? '',
        muscleGroup: current?.muscleGroup ?? '',
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
      muscleGroup: value.muscleGroup.trim(),
      description: value.description.trim() || null,
    });
  }
}