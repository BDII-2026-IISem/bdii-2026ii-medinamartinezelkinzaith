from django.contrib import admin

from apps.trainer.models import Trainer


@admin.register(Trainer)
class TrainerAdmin(admin.ModelAdmin):
    list_display = ("name", "specialty", "email", "phone", "status", "created_at")
    list_filter = ("status",)
    search_fields = ("name", "email", "phone", "specialty")
    list_editable = ("status",)
    ordering = ("name",)
    readonly_fields = ("created_at", "updated_at")
    fieldsets = (
        (
            "Información del entrenador",
            {"fields": ("name", "specialty", "email", "phone")},
        ),
        ("Estado", {"fields": ("status",)}),
        (
            "Auditoría",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )