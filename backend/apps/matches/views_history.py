from rest_framework import generics, status
from rest_framework.response import Response
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


class HistoryMatchDeleteView(generics.DestroyAPIView):
    """DELETE /api/v1/history/matches/{match_id}/ - Remove a match from the current golfer's history."""
    queryset = Match.objects.all()
    lookup_url_kwarg = 'match_id'

    def destroy(self, request, *args, **kwargs):
        match = self.get_object()
        golfer = request.user.golfer_profile

        Score.objects.filter(match=match, golfer=golfer).delete()
        Ranking.objects.filter(match=match, golfer=golfer).delete()

        if not Ranking.objects.filter(match=match).exists() and not Score.objects.filter(match=match).exists():
            match.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)
