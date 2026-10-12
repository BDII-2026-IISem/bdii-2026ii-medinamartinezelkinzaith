from django.contrib import admin
from .models import Client  
# Register your models here.
@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ("document_type", "document_number", "name", "phone", "email")
    search_fields = ("document_number", "name", "email")
    list_filter = ("status",)
    