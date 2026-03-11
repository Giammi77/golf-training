from django.contrib import admin
from .models import Club


@admin.register(Club)
class ClubAdmin(admin.ModelAdmin):
    list_display = ['ragione_sociale', 'localita', 'provincia', 'email', 'hcp_max']
    search_fields = ['ragione_sociale', 'localita']
