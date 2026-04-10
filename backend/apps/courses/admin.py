from django.contrib import admin, messages
from .models import Hole, HcpStrokeAllocation


class HcpStrokeAllocationInline(admin.TabularInline):
    model = HcpStrokeAllocation
    extra = 0


@admin.action(description='Duplica buche 1-9 in 10-18 (per il club selezionato)')
def duplica_9_in_18(modeladmin, request, queryset):
    clubs = set(queryset.values_list('club_id', flat=True))
    total_created = 0
    for club_id in clubs:
        buche_1_9 = Hole.objects.filter(club_id=club_id, nr_buca__in=range(1, 10))
        for buca in buche_1_9:
            nuovo_nr = buca.nr_buca + 9
            if Hole.objects.filter(club_id=club_id, nr_buca=nuovo_nr).exists():
                continue
            allocations = list(buca.hcp_allocations.all())
            buca.pk = None
            buca.nr_buca = nuovo_nr
            buca.legacy_id = None
            buca.save()
            for alloc in allocations:
                alloc.pk = None
                alloc.hole = buca
                alloc.legacy_id = None
                alloc.save()
            total_created += 1
    messages.success(request, f'Create {total_created} buche (10-18).')


@admin.register(Hole)
class HoleAdmin(admin.ModelAdmin):
    list_display = ['club', 'nr_buca', 'denominazione', 'nr_colpi', 'hcp_buca']
    list_filter = ['club']
    ordering = ['club', 'nr_buca']
    inlines = [HcpStrokeAllocationInline]
    actions = [duplica_9_in_18]


@admin.register(HcpStrokeAllocation)
class HcpStrokeAllocationAdmin(admin.ModelAdmin):
    list_display = ['hole', 'da_hcp', 'a_hcp', 'colpi_aggiuntivi']
