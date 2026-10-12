from decimal import Decimal

from django.core.validators import MinValueValidator
from django.db import models, transaction
from django.utils import timezone

from apps.common.models import ActivaFitModel, TimeStampedModel
from apps.common.status import RecordStatus
from apps.membership.managers import MembershipManager


class Membership(ActivaFitModel):
    client = models.ForeignKey(
        "client.Client",
        on_delete=models.RESTRICT,
        related_name="memberships",
        db_column="client_id",
    )
    plan = models.ForeignKey(
        "plan.Plan",
        on_delete=models.RESTRICT,
        related_name="memberships",
        db_column="plan_id",
    )
    start_date = models.DateField()
    end_date = models.DateField()

    objects = MembershipManager()

    class Meta:
        db_table = "memberships"
        verbose_name = "membresía"
        verbose_name_plural = "membresías"
        ordering = ["-start_date", "-id"]
        constraints = [
            ActivaFitModel.status_constraint("memberships_status_valid"),
            models.CheckConstraint(
                condition=models.Q(end_date__gte=models.F("start_date")),
                name="memberships_dates_valid",
            ),
        ]

    def __str__(self):
        return f"Membresía {self.pk}"

    def void(self):
        with transaction.atomic():
            membership = Membership.objects.select_for_update().get(pk=self.pk)
            if membership.status == RecordStatus.INACTIVE:
                return membership
            for payment in membership.payments.select_for_update():
                if payment.status != RecordStatus.ACTIVE:
                    continue
                payment.status = RecordStatus.INACTIVE
                payment.save(update_fields=["status"])
            membership.status = RecordStatus.INACTIVE
            membership.save(update_fields=["status", "updated_at"])
            return membership


class Payment(models.Model):
    membership = models.ForeignKey(
        Membership,
        on_delete=models.RESTRICT,
        related_name="payments",
        db_column="membership_id",
    )
    method = models.CharField(max_length=30)
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0"))],
    )
    payment_date = models.DateTimeField(default=timezone.now)
    status = models.CharField(
        max_length=8,
        choices=RecordStatus.choices,
        default=RecordStatus.INACTIVE,
    )

    class Meta:
        db_table = "payments"
        verbose_name = "pago"
        verbose_name_plural = "pagos"
        ordering = ["-payment_date", "-id"]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(status__in=RecordStatus.values),
                name="payments_status_valid",
            ),
            models.CheckConstraint(
                condition=models.Q(amount__gte=0),
                name="payments_amount_non_neg",
            ),
        ]

    def __str__(self):
        return f"Pago {self.pk} - {self.amount}"


class Attendance(TimeStampedModel):
    membership = models.ForeignKey(
        Membership,
        on_delete=models.RESTRICT,
        related_name="attendances",
        db_column="membership_id",
    )
    attendance_date = models.DateTimeField(default=timezone.now)
    type = models.CharField(max_length=20)

    class Meta:
        db_table = "attendances"
        verbose_name = "asistencia"
        verbose_name_plural = "asistencias"
        ordering = ["-attendance_date", "-id"]

    def __str__(self):
        return f"Asistencia {self.pk}"