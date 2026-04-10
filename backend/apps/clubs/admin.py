from django.contrib import admin, messages
from .models import Club


def _copia_buca(buca_originale, nuovo_club, nuovo_nr_buca):
    """Duplica una buca (e le sue allocazioni HCP) nel nuovo club con il nr_buca specificato."""
    allocations = list(buca_originale.hcp_allocations.all())
    buca_originale.pk = None
    buca_originale.club = nuovo_club
    buca_originale.nr_buca = nuovo_nr_buca
    buca_originale.legacy_id = None
    buca_originale.save()
    for alloc in allocations:
        alloc.pk = None
        alloc.hole = buca_originale
        alloc.legacy_id = None
        alloc.save()


@admin.action(description='Duplica club come versione 18 buche (copia 1-9 in 10-18)')
def duplica_come_18_buche(modeladmin, request, queryset):
    from apps.courses.models import Hole

    created_clubs = 0
    for club in queryset:
        original_id = club.pk
        buche_originali_ids = list(
            Hole.objects.filter(club_id=original_id, nr_buca__in=range(1, 10))
            .order_by('nr_buca')
            .values_list('id', flat=True)
        )
        if not buche_originali_ids:
            messages.warning(request, f'Il club "{club.ragione_sociale}" non ha buche 1-9, saltato.')
            continue

        club.pk = None
        club.ragione_sociale = f'{club.ragione_sociale} (18 buche)'
        club.legacy_id = None
        club.save()

        for buca_id in buche_originali_ids:
            originale = Hole.objects.get(pk=buca_id)
            _copia_buca(Hole.objects.get(pk=buca_id), club, originale.nr_buca)
            _copia_buca(Hole.objects.get(pk=buca_id), club, originale.nr_buca + 9)

        created_clubs += 1

    if created_clubs:
        messages.success(request, f'Creati {created_clubs} club con 18 buche.')


@admin.register(Club)
class ClubAdmin(admin.ModelAdmin):
    list_display = ['ragione_sociale', 'localita', 'provincia', 'email', 'hcp_max']
    search_fields = ['ragione_sociale', 'localita']
    actions = [duplica_come_18_buche]
