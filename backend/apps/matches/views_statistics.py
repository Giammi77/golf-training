from rest_framework import views
from rest_framework.response import Response
from django.db.models import Sum, Case, When, Value, IntegerField, F, Avg, Count, Max
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


class StatisticsSummaryView(views.APIView):
    """GET /api/v1/statistics/summary/ - Dashboard summary cards."""

    def get(self, request):
        golfer = request.user.golfer_profile

        rankings = Ranking.objects.filter(golfer=golfer)
        total_matches = rankings.count()

        if total_matches == 0:
            return Response({
                'total_matches': 0,
                'avg_points': 0,
                'max_points': 0,
                'avg_last_5': 0,
            })

        agg = rankings.aggregate(
            avg_points=Avg('punti'),
            max_points=Max('punti'),
        )

        last_5 = rankings.select_related('match').order_by(
            '-match__data', '-match__nr_giro'
        )[:5]
        last_5_avg = sum(r.punti for r in last_5) / len(last_5) if last_5 else 0

        return Response({
            'total_matches': total_matches,
            'avg_points': round(agg['avg_points'] or 0, 1),
            'max_points': agg['max_points'] or 0,
            'avg_last_5': round(last_5_avg, 1),
        })


class ParPerformanceView(views.APIView):
    """GET /api/v1/statistics/par-performance/ - Average points by hole par (3/4/5)."""

    def get(self, request):
        golfer = request.user.golfer_profile

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
        ).values('hole__nr_colpi').annotate(
            avg_punti=Avg('punti_buca'),
            num_buche=Count('id'),
        ).order_by('hole__nr_colpi')

        data = [
            {
                'par': s['hole__nr_colpi'],
                'avg_punti': round(s['avg_punti'] or 0, 2),
                'num_buche': s['num_buche'],
            }
            for s in scores
        ]

        return Response(data)
