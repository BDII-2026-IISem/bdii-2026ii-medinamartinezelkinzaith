from decimal import Decimal

from django.core.exceptions import ValidationError
from django.db import models, transaction
from django.utils import timezone

from apps.common.status import RecordStatus


class MembershipQuerySet(models.QuerySet):
    def register(self, *, client, plan, start_date, end_date, payments):
        if not payments:
            raise ValidationError({"payments": ["La membresía requiere al menos un pago."]})
        if end_date < start_date:
            raise ValidationError(
                {"end_date": ["La fecha de fin no puede ser anterior a la de inicio."]}
            )

        normalized = []
        for payment in payments:
            amount = Decimal(payment["amount"]).quantize(Decimal("0.01"))
            if amount < 0:
                raise ValidationError({"payments": ["El monto no puede ser negativo."]})
            normalized.append(
                {
                    "method": payment["method"],
                    "amount": amount,
                    "payment_date": payment.get("payment_date") or timezone.now(),
                }
            )

        with transaction.atomic():
            locked_client = client.__class__.objects.select_for_update().get(pk=client.pk)
            if locked_client.status != RecordStatus.ACTIVE:
                raise ValidationError({"client_id": ["El cliente debe estar active."]})

            locked_plan = plan.__class__.objects.select_for_update().get(pk=plan.pk)
            if locked_plan.status != RecordStatus.ACTIVE:
                raise ValidationError({"plan_id": ["El plan debe estar active."]})

            overlap = self.model.objects.filter(
                client=locked_client,
                status=RecordStatus.ACTIVE,
                start_date__lte=end_date,
                end_date__gte=start_date,
            ).exists()
            if overlap:
                raise ValidationError(
                    {
                        "start_date": [
                            "El cliente ya tiene una membresía vigente que se cruza con esas fechas."
                        ]
                    }
                )

            membership = self.model(
                client=locked_client,
                plan=locked_plan,
                start_date=start_date,
                end_date=end_date,
                status=RecordStatus.INACTIVE,
            )
            membership.save()

            for payment in normalized:
                membership.payments.create(
                    method=payment["method"],
                    amount=payment["amount"],
                    payment_date=payment["payment_date"],
                    status=RecordStatus.ACTIVE,
                )

            membership.status = RecordStatus.ACTIVE
            membership.save(update_fields=["status", "updated_at"])
            return membership


class MembershipManager(models.Manager.from_queryset(MembershipQuerySet)):
    pass