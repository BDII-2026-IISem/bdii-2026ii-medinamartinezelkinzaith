from decimal import Decimal

from django.core.validators import MinLengthValidator, MinValueValidator
from django.db import models

from apps.common.models import ActivaFitModel


class Exercise(ActivaFitModel):
    name = models.CharField(max_length=120, unique=True, validators=[MinLengthValidator(2)])
    description = models.CharField(max_length=255, null=True, blank=True)
    muscle_group = models.CharField(max_length=50)

    class Meta:
        db_table = "exercises"
        verbose_name = "ejercicio"
        verbose_name_plural = "ejercicios"
        ordering = ["name", "id"]
        constraints = [ActivaFitModel.status_constraint("exercises_status_valid")]

    def __str__(self):
        return self.name


class Routine(ActivaFitModel):
    trainer = models.ForeignKey(
        "trainer.Trainer",
        on_delete=models.RESTRICT,
        related_name="routines",
        db_column="trainer_id",
    )
    client = models.ForeignKey(
        "client.Client",
        on_delete=models.RESTRICT,
        related_name="routines",
        db_column="client_id",
    )
    name = models.CharField(max_length=120, validators=[MinLengthValidator(2)])
    description = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        db_table = "routines"
        verbose_name = "rutina"
        verbose_name_plural = "rutinas"
        ordering = ["name", "id"]
        constraints = [ActivaFitModel.status_constraint("routines_status_valid")]

    def __str__(self):
        return self.name


class RoutineExercise(ActivaFitModel):
    routine = models.ForeignKey(
        Routine,
        on_delete=models.RESTRICT,
        related_name="routine_exercises",
        db_column="routine_id",
    )
    exercise = models.ForeignKey(
        Exercise,
        on_delete=models.RESTRICT,
        related_name="routine_exercises",
        db_column="exercise_id",
    )
    sets = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    repetitions = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    weight = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        default=Decimal("0"),
        validators=[MinValueValidator(Decimal("0"))],
    )
    rest_seconds = models.PositiveIntegerField(default=0)
    name = models.CharField(max_length=120)
    description = models.CharField(max_length=255, null=True, blank=True)
    muscle_group = models.CharField(max_length=50)

    class Meta:
        db_table = "routine_exercises"
        verbose_name = "ejercicio de rutina"
        verbose_name_plural = "ejercicios de rutina"
        ordering = ["routine", "id"]
        constraints = [
            ActivaFitModel.status_constraint("routine_ex_status_valid"),
            models.CheckConstraint(
                condition=models.Q(weight__gte=0),
                name="routine_ex_weight_non_neg",
            ),
        ]

    def __str__(self):
        return f"{self.routine_id} - {self.name}"