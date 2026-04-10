from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns = [
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', views.RegisterView.as_view(), name='register'),
    path('me/', views.MeView.as_view(), name='me'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change_password'),
    path('golfers/', views.GolferListView.as_view(), name='golfer_list'),
    path('golfers/<int:pk>/reset-password/', views.ResetGolferPasswordView.as_view(), name='reset_golfer_password'),
    path('reset-scores/', views.ResetMyScoresView.as_view(), name='reset_my_scores'),
]
