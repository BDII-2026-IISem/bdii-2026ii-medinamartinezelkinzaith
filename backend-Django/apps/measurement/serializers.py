from rest_framework import serializers

from apps.client.models import Client
from apps.measurement.models import Measurement
from apps.trainer.models import Trainer


class MeasurementSerializer(serializers.ModelSerializer):
    client_id = serializers.PrimaryKeyRelatedField(
        source="client",
        queryset=Client.objects.all(),
    )
    trainer_id = serializers.PrimaryKeyRelatedField(
        source="trainer",
        queryset=Trainer.objects.all(),
    )
    client_name = serializers.CharField(source="client.name", read_only=True)
    trainer_name = serializers.CharField(source="trainer.name", read_only=True)

    class Meta:
        model = Measurement
        fields = [
            "id",
            "client_id",
            "client_name",
            "trainer_id",
            "trainer_name",
            "weight",
            "height",
            "body_fat",
            "bmi",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "client_name", "trainer_name", "created_at", "updated_at"]