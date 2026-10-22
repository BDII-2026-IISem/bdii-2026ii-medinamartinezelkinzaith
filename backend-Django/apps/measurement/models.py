from decimal import Decimal

from django.core.validators import MinValueValidator
from django.db import models

from apps.common.models import TimeStampedModel


class Measurement(TimeStampedModel):
    client = models.ForeignKey(
        "client.Client",
        on_delete=models.RESTRICT,
        related_name="measurements",
        db_column="client_id",
    )
    weight = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    height = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    body_fat = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    bmi = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)

    class Meta:
        db_table = "measurements"
        verbose_name = "medida"
        verbose_name_plural = "medidas"
        ordering = ["-created_at", "id"]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(weight__gt=0),
                name="measurements_weight_pos",
            ),
            models.CheckConstraint(
                condition=models.Q(height__gt=0),
                name="measurements_height_pos",
            ),
        ]

    def __str__(self):
        return f"Medida {self.id} - cliente {self.client_id}"