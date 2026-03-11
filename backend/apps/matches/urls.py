from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.RegisterMatchView.as_view(), name='register-match'),
    path('<int:match_id>/scores/', views.MatchScoresView.as_view(), name='match-scores'),
    path('<int:match_id>/leaderboard/', views.MatchLeaderboardView.as_view(), name='match-leaderboard'),
]
