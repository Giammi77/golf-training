from rest_framework import generics
from django.db.models import Sum, Case, When, Value, IntegerField, F, Subquery, OuterRef
from .models import Match, Score, Ranking
from .serializers import HistoryMatchSerializer, ScoreSerializer


class HistoryMatchListView(generics.ListAPIView):
    """GET /api/v1/history/matches/ - Past matches for the current golfer."""
    serializer_class = HistoryMatchSerializer

    def get_queryset(self):
        golfer = self.request.user.golfer_profile

        return Match.objects.filter(
            rankings__golfer=golfer,
        ).annotate(
            punti=Subquery(
                Ranking.objects.filter(
                    match=OuterRef('pk'),
                    golfer=golfer,
                ).values('punti')[:1]
            ),
            posizione=Subquery(
                Ranking.objects.filter(
                    match=OuterRef('pk'),
                    golfer=golfer,
                ).values('posizione')[:1]
            ),
            terminato=Subquery(
                Score.objects.filter(
                    match=OuterRef('pk'),
                    golfer=golfer,
                    terminato=True,
                ).values('terminato')[:1]
            ),
        ).order_by('-data', '-nr_giro')


class HistoryScoreDetailView(generics.ListAPIView):
    """GET /api/v1/history/matches/{match_id}/scores/ - Scores for a past match."""
    serializer_class = ScoreSerializer

    def get_queryset(self):
        match_id = self.kwargs['match_id']
        golfer = self.request.user.golfer_profile
        return Score.objects.filter(
            match_id=match_id,
            golfer=golfer,
        ).select_related('hole').order_by('hole__nr_buca')
