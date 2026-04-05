from django.urls import path
from . import views_history

urlpatterns = [
    path('matches/', views_history.HistoryMatchListView.as_view(), name='history-matches'),
    path('matches/<int:match_id>/', views_history.HistoryMatchDeleteView.as_view(), name='history-match-delete'),
    path('matches/<int:match_id>/scores/', views_history.HistoryScoreDetailView.as_view(), name='history-scores'),
]
