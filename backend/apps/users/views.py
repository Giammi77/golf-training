from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.matches.models import Score, Ranking
from .models import User, PasswordResetToken
from .serializers import (
    MeSerializer,
    ChangePasswordSerializer,
    AdminGolferSerializer,
    RegisterSerializer,
    PasswordResetConfirmSerializer,
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


class GenerateResetLinkView(APIView):
    """POST /api/v1/auth/golfers/<id>/reset-link/ - Generate one-time reset token (admin only)."""
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response(
                {'detail': 'Giocatore non trovato.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        token_obj = PasswordResetToken.create_for_user(user)
        return Response({
            'token': token_obj.token,
            'username': user.username,
            'full_name': f'{user.first_name} {user.last_name}'.strip(),
            'expires_hours': 24,
        })


class PasswordResetConfirmView(APIView):
    """POST /api/v1/auth/password-reset/confirm/ - Public: consume token and set new password."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({'detail': 'Password aggiornata con successo.', 'username': user.username})


class RegisterView(APIView):
    """POST /api/v1/auth/register/ - Public endpoint: self-registration for new golfers."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {'id': user.id, 'username': user.username, 'detail': 'Registrazione completata.'},
            status=status.HTTP_201_CREATED,
        )


class ResetMyScoresView(APIView):
    """POST /api/v1/auth/reset-scores/ - Delete all scores and rankings for current user."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        profile = getattr(request.user, 'golfer_profile', None)
        if not profile:
            return Response(
                {'detail': 'Profilo golfista non trovato.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        scores_deleted, _ = Score.objects.filter(golfer=profile).delete()
        rankings_deleted, _ = Ranking.objects.filter(golfer=profile).delete()
        return Response({
            'detail': f'Eliminati {scores_deleted} score e {rankings_deleted} classifiche.',
        })
