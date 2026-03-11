from django.db import models


class OfficialResult(models.Model):
    """Official handicap variation result. Maps to glf.result."""
    user = models.ForeignKey('users.User', on_delete=models.PROTECT, related_name='results')
    data = models.DateField('Data', blank=True, null=True)
    tesserato = models.CharField('Tesserato', max_length=255, blank=True, default='')
    numero_tessera = models.CharField('Numero Tessera', max_length=50, blank=True, default='')
    gara = models.CharField('Gara', max_length=255, blank=True, default='')
    processo = models.CharField('Processo', max_length=255, blank=True, default='')
    motivazione_variazione = models.CharField('Motivazione Variazione', max_length=255, blank=True, default='')
    esecutore = models.CharField('Esecutore', max_length=255, blank=True, default='')
    giro = models.CharField('Giro', max_length=50, blank=True, default='')
    formula = models.CharField('Formula', max_length=50, blank=True, default='')
    buche = models.CharField('Buche', max_length=50, blank=True, default='')
    valida = models.CharField('Valida', max_length=50, blank=True, default='')
    playing_hcp = models.CharField('Playing HCP', max_length=50, blank=True, default='')
    par = models.CharField('Par', max_length=50, blank=True, default='')
    cr = models.CharField('CR', max_length=50, blank=True, default='')
    sr = models.CharField('SR', max_length=50, blank=True, default='')
    stbl = models.CharField('STBL', max_length=50, blank=True, default='')
    ags = models.CharField('AGS', max_length=50, blank=True, default='')
    pcc = models.CharField('PCC', max_length=50, blank=True, default='')
    sd = models.DecimalField('SD', max_digits=8, decimal_places=2, blank=True, null=True)
    corr_sd = models.CharField('Corr SD', max_length=50, blank=True, default='')
    corr = models.CharField('Corr', max_length=50, blank=True, default='')
    index_vecchio = models.CharField('Index Vecchio', max_length=50, blank=True, default='')
    index_nuovo = models.CharField('Index Nuovo', max_length=50, blank=True, default='')
    variazione = models.CharField('Variazione', max_length=50, blank=True, default='')
    row_count = models.IntegerField('Row Count', blank=True, null=True)
    legacy_id = models.CharField(max_length=22, blank=True, null=True, db_index=True)

    class Meta:
        db_table = 'golf_official_result'
        verbose_name = 'Risultato Ufficiale'
        verbose_name_plural = 'Risultati Ufficiali'
        ordering = ['-row_count']

    def __str__(self):
        return f"{self.data} - {self.gara}"
