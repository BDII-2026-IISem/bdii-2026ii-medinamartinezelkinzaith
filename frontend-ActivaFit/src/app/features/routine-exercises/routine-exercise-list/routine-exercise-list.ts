import { Component, computed, inject, signal } from '@angular/core';
import { HasPermission } from '../../../shared/directives/has-permission';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { forkJoin } from 'rxjs';
import { Exercise } from '../../../core/models/exercise.model';
import {
  RoutineExercise,
  RoutineExercisePayload,
} from '../../../core/models/routine-exercise.model';
import { Routine } from '../../../core/models/routine.model';
import { NotificationService } from '../../../core/services/notification.service';
import { filterRows } from '../../../core/utils/filter-rows';
import { toApiMessage } from '../../../core/utils/to-api-message';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../../shared/ui/page-header/page-header';
import { StatusTag } from '../../../shared/ui/status-tag/status-tag';
import { ExerciseApi } from '../../exercises/exercise-api';
import { RoutineApi } from '../../routines/routine-api';
import { RoutineExerciseApi } from '../routine-exercise-api';
import { RoutineExerciseForm } from '../routine-exercise-form/routine-exercise-form';

/** Dueña del estado del CRUD de ejercicios de rutina. */
@Component({
  host: { class: 'block' },
  selector: 'app-routine-exercise-list',
  imports: [
    HasPermission,
    ButtonModule,
    DialogModule,
    EmptyState,
    InputTextModule,
    MessageModule,
    PageHeader,
    RoutineExerciseForm,
    StatusTag,
    TableModule,
    TagModule,
    TooltipModule,
  ],
  templateUrl: './routine-exercise-list.html',
  styleUrl: './routine-exercise-list.css',
})
export class RoutineExerciseList {
  private readonly api = inject(RoutineExerciseApi);
  private readonly routinesApi = inject(RoutineApi);
  private readonly exercisesApi = inject(ExerciseApi);
  private readonly notify = inject(NotificationService);
  private readonly confirmation = inject(ConfirmationService);

  readonly rows = signal<RoutineExercise[]>([]);
  readonly routines = signal<Routine[]>([]);
  readonly exercises = signal<Exercise[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly filter = signal('');
  readonly dialogVisible = signal(false);
  readonly editing = signal<RoutineExercise | null>(null);
  readonly resetKey = signal(0);

  private readonly routineNames = computed(
    () => new Map(this.routines().map((routine) => [routine.id, routine.name])),
  );

  readonly visibleRows = computed(() =>
    filterRows(this.rows(), this.filter(), (l) => [l.name, l.muscleGroup, this.routineLabel(l)]),
  );

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      lines: this.api.list('active'),
      routines: this.routinesApi.list('active'),
      exercises: this.exercisesApi.list('active'),
    }).subscribe({
      next: ({ lines, routines, exercises }) => {
        this.rows.set(lines);
        this.routines.set(routines);
        this.exercises.set(exercises);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.rows.set([]);
        this.error.set(toApiMessage(error));
        this.loading.set(false);
      },
    });
  }

  routineLabel(line: RoutineExercise): string {
    return this.routineNames().get(line.routineId) ?? `Rutina #${line.routineId}`;
  }

  openCreate(): void {
    this.editing.set(null);
    this.resetKey.update((key) => key + 1);
    this.dialogVisible.set(true);
  }

  openEdit(line: RoutineExercise): void {
    this.editing.set(line);
    this.resetKey.update((key) => key + 1);
    this.dialogVisible.set(true);
  }

  save(payload: RoutineExercisePayload): void {
    const current = this.editing();
    this.saving.set(true);
    const request = current
      ? this.api.update(current.id, payload)
      : this.api.create({ ...payload, status: 'active' });
    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogVisible.set(false);
        this.notify.success(current ? 'Ejercicio de rutina actualizado' : 'Ejercicio agregado a la rutina');
        this.load();
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.notify.error('No se pudo guardar', toApiMessage(error));
      },
    });
  }

  deactivate(line: RoutineExercise): void {
    this.confirmation.confirm({
      header: 'Desactivar',
      message: `¿Quitar «${line.name}» de la rutina ${this.routineLabel(line)}? La fila se conserva inactiva.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Desactivar',
      rejectLabel: 'Cancelar',
      accept: () =>
        this.api.remove(line.id).subscribe({
          next: () => {
            this.notify.warn('Ejercicio de rutina desactivado');
            this.load();
          },
          error: (error: unknown) =>
            this.notify.error('No se pudo desactivar', toApiMessage(error)),
        }),
    });
  }
}
