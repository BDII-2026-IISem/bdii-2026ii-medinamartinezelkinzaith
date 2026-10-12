from rest_framework import serializers

from apps.client.models import Client
from apps.routine.models import Exercise, Routine, RoutineExercise
from apps.trainer.models import Trainer


class ExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exercise
        fields = ["id", "name", "description", "muscle_group", "status", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]
        extra_kwargs = {
            "name": {"min_length": 2, "max_length": 120},
            "description": {"required": False, "allow_null": True, "allow_blank": True},
        }

    def validate_description(self, value):
        if value is None or str(value).strip() == "":
            return None
        return value


class RoutineSerializer(serializers.ModelSerializer):
    trainer_id = serializers.PrimaryKeyRelatedField(
        source="trainer",
        queryset=Trainer.objects.all(),
    )
    client_id = serializers.PrimaryKeyRelatedField(
        source="client",
        queryset=Client.objects.all(),
    )
    trainer_name = serializers.CharField(source="trainer.name", read_only=True)
    client_name = serializers.CharField(source="client.name", read_only=True)

    class Meta:
        model = Routine
        fields = [
            "id",
            "trainer_id",
            "trainer_name",
            "client_id",
            "client_name",
            "name",
            "description",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "trainer_name", "client_name", "created_at", "updated_at"]
        extra_kwargs = {
            "name": {"min_length": 2, "max_length": 120},
            "description": {"required": False, "allow_null": True, "allow_blank": True},
        }

    def validate_description(self, value):
        if value is None or str(value).strip() == "":
            return None
        return value


class RoutineExerciseSerializer(serializers.ModelSerializer):
    routine_id = serializers.PrimaryKeyRelatedField(
        source="routine",
        queryset=Routine.objects.all(),
    )
    exercise_id = serializers.PrimaryKeyRelatedField(
        source="exercise",
        queryset=Exercise.objects.all(),
    )

    class Meta:
        model = RoutineExercise
        fields = [
            "id",
            "routine_id",
            "exercise_id",
            "sets",
            "repetitions",
            "weight",
            "rest_seconds",
            "name",
            "description",
            "muscle_group",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
        extra_kwargs = {
            "description": {"required": False, "allow_null": True, "allow_blank": True},
        }

    def validate_description(self, value):
        if value is None or str(value).strip() == "":
            return None
        return value