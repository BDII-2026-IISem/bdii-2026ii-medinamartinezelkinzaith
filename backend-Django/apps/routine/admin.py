from django.contrib import admin

from apps.routine.models import Exercise, Routine, RoutineExercise


@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    list_display = ("name", "muscle_group", "status", "created_at")
    list_filter = ("status", "muscle_group")
    search_fields = ("name", "description", "muscle_group")
    list_editable = ("status",)
    ordering = ("name",)
    readonly_fields = ("created_at", "updated_at")
    fieldsets = (
        (None, {"fields": ("name", "description", "muscle_group", "status")}),
        (
            "Auditoría",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )


@admin.register(Routine)
class RoutineAdmin(admin.ModelAdmin):
    list_display = ("name", "client", "trainer", "status", "created_at")
    list_filter = ("status",)
    search_fields = ("name", "client__name", "trainer__name")
    list_editable = ("status",)
    ordering = ("name",)
    autocomplete_fields = ("client", "trainer")
    readonly_fields = ("created_at", "updated_at")
    fieldsets = (
        ("Información", {"fields": ("name", "description", "client", "trainer")}),
        ("Estado", {"fields": ("status",)}),
        (
            "Auditoría",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("client", "trainer")


@admin.register(RoutineExercise)
class RoutineExerciseAdmin(admin.ModelAdmin):
    list_display = (
        "routine",
        "exercise",
        "sets",
        "repetitions",
        "weight",
        "rest_seconds",
        "status",
    )
    list_filter = ("status",)
    search_fields = ("routine__name", "exercise__name")
    list_editable = ("sets", "repetitions", "weight", "rest_seconds", "status")
    autocomplete_fields = ("routine", "exercise")
    readonly_fields = ("created_at", "updated_at")
    fieldsets = (
        ("Asignación", {"fields": ("routine", "exercise")}),
        ("Series y carga", {"fields": ("sets", "repetitions", "weight", "rest_seconds")}),
        ("Estado", {"fields": ("status",)}),
        (
            "Auditoría",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("routine", "exercise")