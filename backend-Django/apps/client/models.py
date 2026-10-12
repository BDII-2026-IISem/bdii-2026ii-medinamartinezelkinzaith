from django.core.validators import MinLengthValidator
from django.db import models

from apps.common.models import ActivaFitModel


class Client(ActivaFitModel):
    document_number = models.CharField(max_length=30, validators=[MinLengthValidator(5)], unique=True,null=False)
    name = models.CharField(max_length=150, validators=[MinLengthValidator(2)], null=False)
    phone = models.CharField(max_length=30, null=True, blank=True)
    email = models.EmailField(max_length=150, null=False, unique=True)
    document_type = models.CharField(
        max_length=10,
        choices=[
            ("CC", "Cédula de ciudadanía"),
            ("CE", "Cédula de extranjería"),
            ("TI", "Tarjeta de identidad"),
            ("PASSPORT", "Pasaporte"),
        ],
        null=False,
    )
    class Meta:
        db_table = "clients"
        verbose_name = "cliente"
        verbose_name_plural = "clientes"
        ordering = ["name", "id"]
        constraints = [
            ActivaFitModel.status_constraint("clients_status_valid"),
            models.UniqueConstraint(
                fields=["document_type", "document_number"],
                name="clients_document_unique",
            ),
        ]

   
    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if self.email:
            self.email = self.email.strip().lower()
        super().save(*args, **kwargs)