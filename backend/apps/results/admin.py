from django.contrib import admin
from .models import OfficialResult


@admin.register(OfficialResult)
class OfficialResultAdmin(admin.ModelAdmin):
    list_display = ['user', 'data', 'gara', 'sd', 'index_vecchio', 'index_nuovo', 'variazione']
    list_filter = ['user']
    ordering = ['-row_count']
