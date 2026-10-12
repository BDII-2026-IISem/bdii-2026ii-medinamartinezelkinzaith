from rest_framework import serializers

from apps.membership.models import Attendance, Membership, Payment


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