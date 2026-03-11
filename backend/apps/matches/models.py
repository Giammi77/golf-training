from django.db import models


class Match(models.Model):
    """A daily golf match/round. Maps to glf.match."""
    club = models.ForeignKey('clubs.Club', on_delete=models.PROTECT, related_name='matches')
    data = models.DateField('Data')
    nr_giro = models.IntegerField('Nr. Giro', default=1)
    legacy_id = models.CharField(max_length=22, blank=True, null=True, db_index=True)

    class Meta:
        db_table = 'golf_match'
        verbose_name = 'Match'
        verbose_name_plural = 'Match'
        unique_together = [('club', 'data', 'nr_giro')]
        ordering = ['-data', '-nr_giro']

    def __str__(self):
        return f"{self.data} Giro N. {self.nr_giro}"

    @property
    def caption(self):
        return f"{self.data} Giro N. {self.nr_giro}"


class Score(models.Model):
    """Score for a single hole in a match. Maps to glf.score."""
    match = models.ForeignKey(Match, on_delete=models.CASCADE, related_name='scores')
    hole = models.ForeignKey('courses.Hole', on_delete=models.PROTECT, related_name='scores')
    golfer = models.ForeignKey('users.GolferProfile', on_delete=models.CASCADE, related_name='scores')
    club = models.ForeignKey('clubs.Club', on_delete=models.PROTECT, related_name='scores')
    colpi_giocati = models.IntegerField('Colpi Giocati', blank=True, null=True)
    colpi_aggiuntivi = models.IntegerField('Colpi HCP', default=0)
    par_giocatore = models.IntegerField('Par Giocatore')
    terminato = models.BooleanField('Terminato', default=False)
    legacy_id = models.CharField(max_length=22, blank=True, null=True, db_index=True)

    class Meta:
        db_table = 'golf_score'
        verbose_name = 'Score'
        verbose_name_plural = 'Scores'
        ordering = ['hole__nr_buca']

    def __str__(self):
        return f"Score {self.golfer} - Buca {self.hole.nr_buca}"

    @property
    def colpi_zero_stbl(self):
        """Zero-point baseline for Stableford scoring."""
        return self.par_giocatore + 2

    @property
    def punti(self):
        """Stableford points for this hole."""
        if not self.colpi_giocati or self.colpi_giocati == 0:
            return 0
        diff = self.colpi_zero_stbl - self.colpi_giocati
        return max(0, diff)


class Ranking(models.Model):
    """Leaderboard entry for a match. Maps to glf.classifica."""
    match = models.ForeignKey(Match, on_delete=models.CASCADE, related_name='rankings')
    golfer = models.ForeignKey('users.GolferProfile', on_delete=models.CASCADE, related_name='rankings')
    posizione = models.IntegerField('Posizione', blank=True, null=True)
    punti = models.IntegerField('Punti', default=0)
    legacy_id = models.CharField(max_length=22, blank=True, null=True, db_index=True)

    class Meta:
        db_table = 'golf_ranking'
        verbose_name = 'Classifica'
        verbose_name_plural = 'Classifiche'
        unique_together = [('match', 'golfer')]
        ordering = ['posizione']

    def __str__(self):
        return f"Pos. {self.posizione} - {self.golfer}"
