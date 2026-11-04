import { Component, effect, inject, input, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { Exercise } from '../../../core/models/exercise.model';
import {
  RoutineExercise,
  RoutineExercisePayload,
} from '../../../core/models/routine-exercise.model';
import { Routine } from '../../../core/models/routine.model';

/** Alta y edición de una línea de rutina. No conoce la API: recibe y emite. */
@Component({
  host: { class: 'block' },
  selector: 'app-routine-exercise-form',
  imports: [
    ButtonModule,
    InputTextModule,
    MessageModule,
    ReactiveFormsModule,
    SelectModule,
    TextareaModule,
  ],
  templateUrl: './routine-exercise-form.html',
  styleUrl: './routine-exercise-form.css',
})
export class RoutineExerciseForm {
  readonly line = input<RoutineExercise | null>(null);
  /** Solo rutinas y ejercicios activos: los pasa el padre. */
  readonly routines = input<Routine[]>([]);
  readonly exercises = input<Exercise[]>([]);
  readonly resetKey = input(0);
  readonly saving = input(false);

  readonly saved = output<RoutineExercisePayload>();
  readonly cancelled = output<void>();

  private readonly fb = inject(NonNullableFormBuilder);

  readonly form = this.fb.group({
    routineId: this.fb.control<number | null>(null, Validators.required),
    exerciseId: this.fb.control<number | null>(null, Validators.required),
    sets: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(1),
      Validators.pattern(/^\d+$/),
    ]),
    repetitions: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(1),
      Validators.pattern(/^\d+$/),
    ]),
    weight: this.fb.control<number | null>(0, [Validators.required, Validators.min(0)]),
    restSeconds: this.fb.control<number | null>(0, [
      Validators.required,
      Validators.min(0),
      Validators.pattern(/^\d+$/),
    ]),
    name: ['', [Validators.required, Validators.maxLength(120)]],
    muscleGroup: ['', [Validators.required, Validators.maxLength(50)]],
    description: ['', [Validators.maxLength(255)]],
  });

  constructor() {
    effect(() => {
      const current = this.line();
      this.resetKey();
      this.form.reset({
        routineId: current?.routineId ?? null,
        exerciseId: current?.exerciseId ?? null,
        sets: current?.sets ?? null,
        repetitions: current?.repetitions ?? null,
        weight: current ? Number(current.weight) : 0,
        restSeconds: current?.restSeconds ?? 0,
        name: current?.name ?? '',
        muscleGroup: current?.muscleGroup ?? '',
        description: current?.description ?? '',
      });
    });
  }

  /** Al elegir el ejercicio se copian su nombre, grupo muscular y descripción. */
  onExerciseChange(id: number | null): void {
    const exercise = this.exercises().find((item) => item.id === id);
    if (!exercise) return;
    this.form.patchValue({
      name: exercise.name,
      muscleGroup: exercise.muscleGroup,
      description: exercise.description ?? '',
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.saved.emit({
      routineId: value.routineId!,
      exerciseId: value.exerciseId!,
      sets: value.sets!,
      repetitions: value.repetitions!,
      weight: Number(value.weight).toFixed(2),
      restSeconds: value.restSeconds!,
      name: value.name.trim(),
      description: value.description.trim() || null,
      muscleGroup: value.muscleGroup.trim(),
    });
  }
}