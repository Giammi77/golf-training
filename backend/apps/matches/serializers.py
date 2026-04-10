from rest_framework import serializers
from .models import Match, Score, Ranking


class ScoreSerializer(serializers.ModelSerializer):
    punti = serializers.IntegerField(read_only=True)
    nr_buca = serializers.IntegerField(source='hole.nr_buca', read_only=True)
    denominazione = serializers.CharField(source='hole.denominazione', read_only=True)
    par_buca = serializers.IntegerField(source='hole.nr_colpi', read_only=True)

    class Meta:
        model = Score
        fields = ['id', 'nr_buca', 'denominazione', 'par_buca', 'colpi_giocati',
                  'colpi_aggiuntivi', 'par_giocatore', 'punti', 'terminato']
        read_only_fields = ['id', 'nr_buca', 'denominazione', 'par_buca',
                           'colpi_aggiuntivi', 'par_giocatore', 'terminato']


class RankingSerializer(serializers.ModelSerializer):
    golfer_name = serializers.CharField(source='golfer.nominativo', read_only=True)
    golfer_id = serializers.IntegerField(source='golfer.id', read_only=True)

    class Meta:
        model = Ranking
        fields = ['id', 'golfer_id', 'golfer_name', 'posizione', 'punti']


class MatchSerializer(serializers.ModelSerializer):
    club_name = serializers.CharField(source='club.ragione_sociale', read_only=True)
    caption = serializers.CharField(read_only=True)

    class Meta:
        model = Match
        fields = ['id', 'club', 'club_name', 'data', 'nr_giro', 'caption']
        read_only_fields = ['id', 'data', 'nr_giro', 'caption']


class RegisterMatchSerializer(serializers.Serializer):
    club_id = serializers.IntegerField()
    match_id = serializers.IntegerField(required=False, allow_null=True)


class FinishMatchSerializer(serializers.Serializer):
    match_id = serializers.IntegerField()


class HistoryMatchSerializer(serializers.ModelSerializer):
    """Match with totals for the history view."""
    club_name = serializers.CharField(source='club.ragione_sociale', read_only=True)
    punti = serializers.IntegerField(read_only=True)
    posizione = serializers.IntegerField(read_only=True)
    terminato = serializers.BooleanField(read_only=True)

    class Meta:
        model = Match
        fields = ['id', 'club_name', 'data', 'nr_giro', 'punti', 'posizione', 'terminato']
