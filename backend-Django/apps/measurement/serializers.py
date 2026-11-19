from rest_framework import serializers

from apps.client.models import Client
from apps.measurement.models import Measurement


class MeasurementSerializer(serializers.ModelSerializer):
    client_id = serializers.PrimaryKeyRelatedField(
        source="client",
        queryset=Client.objects.all(),
    )
    client_name = serializers.CharField(source="client.name", read_only=True)

    class Meta:
        model = Measurement
        fields = [
            "id",
            "client_id",
            "client_name",
            "weight",
            "height",
            "body_fat",
            "bmi",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "client_name", "created_at", "updated_at"]