from decimal import Decimal

from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from apps.client.models import Client
from apps.membership.models import Attendance, Membership, Payment
from apps.plan.models import Plan


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ["id", "membership", "method", "amount", "payment_date", "status"]
        read_only_fields = fields


class MembershipSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source="client.name", read_only=True)
    plan_name = serializers.CharField(source="plan.name", read_only=True)
    payments = PaymentSerializer(many=True, read_only=True)

    class Meta:
        model = Membership
        fields = [
            "id",
            "client",
            "client_name",
            "plan",
            "plan_name",
            "start_date",
            "end_date",
            "status",
            "payments",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields


class AttendanceSerializer(serializers.ModelSerializer):
    membership_id = serializers.PrimaryKeyRelatedField(
        source="membership",
        queryset=Membership.objects.all(),
    )

    class Meta:
        model = Attendance
        fields = ["id", "membership_id", "attendance_date", "type", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]

class PaymentInputSerializer(serializers.Serializer):
    method = serializers.CharField(max_length=30)
    amount = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        min_value=Decimal("0.00"),
    )
    payment_date = serializers.DateTimeField(required=False)


class MembershipRegisterSerializer(serializers.Serializer):
    client_id = serializers.PrimaryKeyRelatedField(
        queryset=Client.objects.all(),
        source="client",
    )
    plan_id = serializers.PrimaryKeyRelatedField(
        queryset=Plan.objects.all(),
        source="plan",
    )
    start_date = serializers.DateField()
    end_date = serializers.DateField()
    payments = PaymentInputSerializer(many=True, allow_empty=False)

    def create(self, validated_data):
        try:
            return Membership.objects.register(
                client=validated_data["client"],
                plan=validated_data["plan"],
                start_date=validated_data["start_date"],
                end_date=validated_data["end_date"],
                payments=validated_data["payments"],
            )
        except DjangoValidationError as exc:
            if getattr(exc, "message_dict", None):
                raise serializers.ValidationError(exc.message_dict) from exc
            raise serializers.ValidationError(exc.messages) from exc