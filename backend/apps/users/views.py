from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import User
from .serializers import (
    MeSerializer,
    ChangePasswordSerializer,
    AdminGolferSerializer,
)


class MeView(generics.RetrieveUpdateAPIView):
    """GET /api/v1/auth/me/ - Current user profile with golfer data."""
    serializer_class = MeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    """POST /api/v1/auth/change-password/ - Change own password."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data, context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        return Response({'detail': 'Password aggiornata con successo.'})


class GolferListView(generics.ListAPIView):
    """GET /api/v1/auth/golfers/ - List all golfers (admin only)."""
    serializer_class = AdminGolferSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = User.objects.filter(is_active=True, is_staff=False).order_by(
        'last_name', 'first_name'
    )


class ResetGolferPasswordView(APIView):
    """POST /api/v1/auth/golfers/<id>/reset-password/ - Reset to default (admin only)."""
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response(
                {'detail': 'Giocatore non trovato.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        default_password = (user.last_name + user.first_name).lower().replace(' ', '')
        user.set_password(default_password)
        user.save()
        return Response({'detail': f'Password resettata a: {default_password}'})
