from django.db import models


class Club(models.Model):
    """Golf club. Maps to glf.club."""
    ragione_sociale = models.CharField('Ragione Sociale', max_length=255, db_index=True)
    descrizione = models.TextField('Descrizione', blank=True, default='')
    indirizzo = models.CharField('Indirizzo', max_length=255, blank=True, default='')
    numero_civico = models.CharField('Numero Civico', max_length=20, blank=True, default='')
    cap = models.CharField('CAP', max_length=5, blank=True, default='')
    localita = models.CharField('Località', max_length=255, blank=True, default='')
    provincia = models.CharField('Provincia', max_length=2, blank=True, default='')
    note = models.TextField('Note', blank=True, default='')
    telefono = models.CharField('Telefono', max_length=50, blank=True, default='')
    cellulare = models.CharField('Cellulare', max_length=50, blank=True, default='')
    fax = models.CharField('Fax', max_length=50, blank=True, default='')
    email = models.EmailField('Email', blank=True, default='')
    pec = models.EmailField('PEC', blank=True, default='')
    www = models.URLField('Internet', blank=True, default='')
    logo = models.ImageField('Logo', upload_to='clubs/', blank=True, null=True)
    hcp_max = models.IntegerField('Hcp Max', blank=True, null=True)
    legacy_id = models.CharField(max_length=22, blank=True, null=True, db_index=True)

    class Meta:
        db_table = 'golf_club'
        verbose_name = 'Club'
        verbose_name_plural = 'Club'

    def __str__(self):
        return self.ragione_sociale
