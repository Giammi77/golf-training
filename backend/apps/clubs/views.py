from rest_framework import generics, permissions
from .models import Club
from .serializers import ClubSerializer, ClubListSerializer


class ClubListView(generics.ListAPIView):
    """GET /api/v1/clubs/ - List all clubs."""
    queryset = Club.objects.order_by('ragione_sociale')
    serializer_class = ClubListSerializer
    permission_classes = [permissions.AllowAny]


class ClubDetailView(generics.RetrieveAPIView):
    """GET /api/v1/clubs/{id}/ - Club detail."""
    queryset = Club.objects.all()
    serializer_class = ClubSerializer
