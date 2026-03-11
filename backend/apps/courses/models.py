from django.db import models


class Hole(models.Model):
    """A single hole in a golf course. Maps to glf.percorso."""
    club = models.ForeignKey('clubs.Club', on_delete=models.PROTECT, related_name='holes')
    nr_buca = models.IntegerField('Buca')
    denominazione = models.CharField('Denominazione', max_length=255, blank=True, default='')
    descrizione = models.TextField('Descrizione', blank=True, default='')
    note = models.TextField('Note', blank=True, default='')
    nr_colpi = models.IntegerField('Par')
    distanza_t_rossi = models.IntegerField('Distanza Tee Rossi', blank=True, null=True)
    distanza_t_gialli = models.IntegerField('Distanza Tee Gialli', blank=True, null=True)
    hcp_buca = models.IntegerField('Stroke Index', blank=True, null=True)
    img = models.ImageField('Immagine', upload_to='holes/', blank=True, null=True)
    legacy_id = models.CharField(max_length=22, blank=True, null=True, db_index=True)

    class Meta:
        db_table = 'golf_hole'
        verbose_name = 'Buca'
        verbose_name_plural = 'Buche'
        unique_together = [('club', 'nr_buca')]
        ordering = ['nr_buca']

    def __str__(self):
        return f"{self.club} - Buca {self.nr_buca} {self.denominazione}"


class HcpStrokeAllocation(models.Model):
    """HCP stroke allocation lookup table. Maps to glf.hcp_percorso."""
    hole = models.ForeignKey(Hole, on_delete=models.PROTECT, related_name='hcp_allocations')
    hcp = models.DecimalField('Hcp', max_digits=5, decimal_places=1, blank=True, null=True)
    da_hcp = models.DecimalField('Da Hcp', max_digits=5, decimal_places=1, blank=True, null=True)
    a_hcp = models.DecimalField('A Hcp', max_digits=5, decimal_places=1, blank=True, null=True)
    colpi_aggiuntivi = models.IntegerField('Colpi Aggiuntivi', default=0)
    legacy_id = models.CharField(max_length=22, blank=True, null=True, db_index=True)

    class Meta:
        db_table = 'golf_hcp_stroke_allocation'
        verbose_name = 'Allocazione Colpi HCP'
        verbose_name_plural = 'Allocazioni Colpi HCP'

    def __str__(self):
        return f"{self.hole} - HCP {self.hcp}"
