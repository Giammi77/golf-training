from rest_framework import generics
from .models import Hole
from .serializers import HoleSerializer


class HoleListView(generics.ListAPIView):
    """GET /api/v1/courses/?club={id} - List holes for a club."""
    serializer_class = HoleSerializer

    def get_queryset(self):
        qs = Hole.objects.all()
        club_id = self.request.query_params.get('club')
        if club_id:
            qs = qs.filter(club_id=club_id)
        return qs
