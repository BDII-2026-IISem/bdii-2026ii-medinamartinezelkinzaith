from django.contrib import admin

from apps.measurement.models import Measurement


@admin.register(Measurement)
class MeasurementAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "client",
        "trainer",
        "weight",
        "height",
        "body_fat",
        "bmi",
        "created_at",
    )
    search_fields = ("client__name", "trainer__name")
    ordering = ("-created_at",)
    date_hierarchy = "created_at"
    autocomplete_fields = ("client", "trainer")
    readonly_fields = ("created_at", "updated_at")
    fieldsets = (
        ("Asignación", {"fields": ("client", "trainer")}),
        ("Medidas", {"fields": ("weight", "height", "body_fat", "bmi")}),
        (
            "Auditoría",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("client", "trainer")