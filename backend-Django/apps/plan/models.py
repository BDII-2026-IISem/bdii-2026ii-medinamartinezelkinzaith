from django.core.validators import MinLengthValidator
from django.db import models

from apps.common.models import ActivaFitModel


class Plan(ActivaFitModel):
    name = models.CharField(max_length=100, unique=True, validators=[MinLengthValidator(2)])
    description = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        db_table = "plans"
        verbose_name = "plan"
        verbose_name_plural = "planes"
        ordering = ["name", "id"]
        constraints = [ActivaFitModel.status_constraint("plans_status_valid")]

    def __str__(self):
        return self.name