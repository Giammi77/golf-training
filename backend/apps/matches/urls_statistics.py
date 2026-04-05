from django.urls import path
from . import views_statistics

urlpatterns = [
    path('points-trend/', views_statistics.PointsTrendView.as_view(), name='points-trend'),
    path('points-distribution/', views_statistics.PointsDistributionView.as_view(), name='points-distribution'),
    path('summary/', views_statistics.StatisticsSummaryView.as_view(), name='statistics-summary'),
    path('par-performance/', views_statistics.ParPerformanceView.as_view(), name='par-performance'),
]
