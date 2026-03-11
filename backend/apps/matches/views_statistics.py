from rest_framework import views
from rest_framework.response import Response
from django.db.models import Sum, Case, When, Value, IntegerField, F
from .models import Match, Score, Ranking


class PointsTrendView(views.APIView):
    """GET /api/v1/statistics/points-trend/ - Points over last N matches."""

    def get(self, request):
        golfer = request.user.golfer_profile
        limit = int(request.query_params.get('limit', 15))

        rankings = Ranking.objects.filter(
            golfer=golfer,
        ).select_related('match').order_by('-match__data', '-match__nr_giro')[:limit]

        data = [
            {
                'data': r.match.data,
                'nr_giro': r.match.nr_giro,
                'punti': r.punti,
                'posizione': r.posizione,
            }
            for r in reversed(rankings)  # chronological order
        ]

        return Response(data)


class PointsDistributionView(views.APIView):
    """GET /api/v1/statistics/points-distribution/ - Frequency of point values."""

    def get(self, request):
        golfer = request.user.golfer_profile

        # Get all individual hole scores with points
        scores = Score.objects.filter(
            golfer=golfer,
            terminato=True,
            colpi_giocati__isnull=False,
            colpi_giocati__gt=0,
        ).annotate(
            punti_buca=Case(
                When(
                    colpi_giocati__gt=F('par_giocatore') + 2,
                    then=Value(0),
                ),
                default=F('par_giocatore') + 2 - F('colpi_giocati'),
                output_field=IntegerField(),
            )
        ).values('punti_buca').annotate(
            count=Sum(Value(1))
        ).order_by('punti_buca')

        data = [
            {'punti': s['punti_buca'], 'frequenza': s['count']}
            for s in scores
        ]

        return Response(data)
