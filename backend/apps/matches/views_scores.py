from rest_framework import views, status
from rest_framework.response import Response
from .serializers import ScoreSerializer, FinishMatchSerializer
from . import services


class IncrementStrokeView(views.APIView):
    """PATCH /api/v1/scores/{id}/increment/ - Add 1 stroke."""

    def patch(self, request, pk):
        score = services.increment_stroke(pk)
        return Response(ScoreSerializer(score).data)


class DecrementStrokeView(views.APIView):
    """PATCH /api/v1/scores/{id}/decrement/ - Remove 1 stroke."""

    def patch(self, request, pk):
        score = services.decrement_stroke(pk)
        return Response(ScoreSerializer(score).data)


class FinishMatchView(views.APIView):
    """POST /api/v1/scores/finish/ - Mark match as finished for current golfer."""

    def post(self, request):
        serializer = FinishMatchSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        golfer = request.user.golfer_profile
        match_id = serializer.validated_data['match_id']
        finished = services.finish_match(match_id, golfer)

        return Response({
            'terminato': finished,
            'status': 'TERMINATO' if finished else 'ERRORE',
        })
