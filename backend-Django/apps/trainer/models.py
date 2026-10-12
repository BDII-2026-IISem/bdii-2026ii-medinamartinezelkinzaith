from django.core.validators import MinLengthValidator
from django.db import models

from apps.common.models import ActivaFitModel


class Trainer(ActivaFitModel):
    name = models.CharField(max_length=150, validators=[MinLengthValidator(2)])
    phone = models.CharField(max_length=30, null=True, blank=True)
    email = models.EmailField(max_length=150, null=True, blank=True, unique=True)
    specialty = models.CharField(max_length=100, null=True, blank=True)

    class Meta:
        db_table = "trainers"
        verbose_name = "entrenador"
        verbose_name_plural = "entrenadores"
        ordering = ["name", "id"]
        constraints = [ActivaFitModel.status_constraint("trainers_status_valid")]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if self.email:
            self.email = self.email.strip().lower()
        super().save(*args, **kwargs)