from django.contrib import admin
from .models import Match, Score, Ranking


class ScoreInline(admin.TabularInline):
    model = Score
    extra = 0
    readonly_fields = ['punti']


class RankingInline(admin.TabularInline):
    model = Ranking
    extra = 0


@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    list_display = ['club', 'data', 'nr_giro']
    list_filter = ['club', 'data']
    inlines = [RankingInline]


@admin.register(Score)
class ScoreAdmin(admin.ModelAdmin):
    list_display = ['match', 'golfer', 'hole', 'colpi_giocati', 'par_giocatore', 'punti', 'terminato']
    list_filter = ['match__club', 'terminato']

    def punti(self, obj):
        return obj.punti


@admin.register(Ranking)
class RankingAdmin(admin.ModelAdmin):
    list_display = ['match', 'golfer', 'posizione', 'punti']
    list_filter = ['match__club']
