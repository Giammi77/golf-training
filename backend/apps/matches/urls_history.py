from django.urls import path
from . import views_history

urlpatterns = [
    path('matches/', views_history.HistoryMatchListView.as_view(), name='history-matches'),
    path('matches/<int:match_id>/scores/', views_history.HistoryScoreDetailView.as_view(), name='history-scores'),
]
