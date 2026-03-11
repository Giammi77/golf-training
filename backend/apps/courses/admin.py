from django.contrib import admin
from .models import Hole, HcpStrokeAllocation


class HcpStrokeAllocationInline(admin.TabularInline):
    model = HcpStrokeAllocation
    extra = 0


@admin.register(Hole)
class HoleAdmin(admin.ModelAdmin):
    list_display = ['club', 'nr_buca', 'denominazione', 'nr_colpi', 'hcp_buca']
    list_filter = ['club']
    ordering = ['club', 'nr_buca']
    inlines = [HcpStrokeAllocationInline]


@admin.register(HcpStrokeAllocation)
class HcpStrokeAllocationAdmin(admin.ModelAdmin):
    list_display = ['hole', 'da_hcp', 'a_hcp', 'colpi_aggiuntivi']
