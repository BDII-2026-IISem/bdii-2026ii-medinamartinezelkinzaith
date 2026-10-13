from django.contrib import admin

from apps.membership.models import Attendance, Membership, Payment


class PaymentInline(admin.TabularInline):
    model = Payment
    extra = 0
    can_delete = False
    show_change_link = True
    fields = ("method", "amount", "payment_date", "status")
    readonly_fields = ("method", "amount", "payment_date", "status")

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(Membership)
class MembershipAdmin(admin.ModelAdmin):
    list_display = ("id", "client", "plan", "start_date", "end_date", "status")
    list_filter = ("status", "start_date", "plan")
    search_fields = ("client__name", "client__email", "plan__name")
    ordering = ("-start_date",)
    date_hierarchy = "start_date"
    readonly_fields = (
        "client",
        "plan",
        "start_date",
        "end_date",
        "status",
        "created_at",
        "updated_at",
    )
    fieldsets = (
        ("Información de la membresía", {"fields": ("client", "plan", "status")}),
        ("Vigencia", {"fields": ("start_date", "end_date"), "classes": ("collapse",)}),
        (
            "Auditoría",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )
    inlines = (PaymentInline,)

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("client", "plan")


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("membership", "method", "amount", "payment_date", "status")
    list_filter = ("status", "method", "payment_date")
    search_fields = ("membership__client__name", "method")
    ordering = ("-payment_date", "id")
    readonly_fields = (
        "membership",
        "method",
        "amount",
        "payment_date",
        "status",
    )
    fieldsets = (
        ("Pago", {"fields": ("membership", "method", "amount", "payment_date")}),
        ("Estado", {"fields": ("status",)}),
    )

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            "membership", "membership__client"
        )


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ("membership", "type", "attendance_date", "created_at")
    list_filter = ("type", "attendance_date")
    search_fields = ("membership__client__name", "type")
    ordering = ("-attendance_date",)
    date_hierarchy = "attendance_date"
    autocomplete_fields = ("membership",)
    readonly_fields = ("created_at", "updated_at")
    fieldsets = (
        ("Asistencia", {"fields": ("membership", "type", "attendance_date")}),
        (
            "Auditoría",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            "membership", "membership__client"
        )