from rest_framework import serializers

from apps.trainer.models import Trainer


class TrainerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trainer
        fields = [
            "id",
            "name",
            "phone",
            "email",
            "specialty",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
        extra_kwargs = {
            "name": {"min_length": 2, "max_length": 150},
            "email": {"required": False, "allow_null": True, "allow_blank": True},
            "phone": {"required": False, "allow_null": True, "allow_blank": True},
            "specialty": {"required": False, "allow_null": True, "allow_blank": True},
        }

    def validate_email(self, value):
        if value is None or str(value).strip() == "":
            return None
        return value.strip().lower()

    def validate(self, attrs):
        for field in ("phone", "specialty"):
            if attrs.get(field) == "":
                attrs[field] = None
        return attrs