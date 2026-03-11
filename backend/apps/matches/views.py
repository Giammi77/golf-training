from rest_framework import generics, status, views
from rest_framework.response import Response
from .models import Match, Score, Ranking
from .serializers import (
    MatchSerializer, ScoreSerializer, RankingSerializer,
    RegisterMatchSerializer, FinishMatchSerializer,
)
from . import services


class RegisterMatchView(views.APIView):
    """POST /api/v1/matches/register/ - Register/join today's match."""

    def post(self, request):
        serializer = RegisterMatchSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        golfer = request.user.golfer_profile
        club_id = serializer.validated_data['club_id']

        match = services.register_match(club_id, golfer)
        scores = Score.objects.filter(
            match=match, golfer=golfer
        ).select_related('hole').order_by('hole__nr_buca')

        return Response({
            'match': MatchSerializer(match).data,
            'scores': ScoreSerializer(scores, many=True).data,
        }, status=status.HTTP_200_OK)


class MatchScoresView(generics.ListAPIView):
    """GET /api/v1/matches/{match_id}/scores/ - Scores for a match."""
    serializer_class = ScoreSerializer

    def get_queryset(self):
        match_id = self.kwargs['match_id']
        golfer_id = self.request.query_params.get('golfer')

        qs = Score.objects.filter(
            match_id=match_id
        ).select_related('hole')

        if golfer_id:
            qs = qs.filter(golfer_id=golfer_id)
        else:
            # Default: current user's scores
            qs = qs.filter(golfer=self.request.user.golfer_profile)

        return qs.order_by('hole__nr_buca')


class MatchLeaderboardView(generics.ListAPIView):
    """GET /api/v1/matches/{match_id}/leaderboard/ - Rankings."""
    serializer_class = RankingSerializer
    pagination_class = None

    def get_queryset(self):
        match_id = self.kwargs['match_id']
        return Ranking.objects.filter(
            match_id=match_id
        ).select_related('golfer__user').order_by('posizione')
