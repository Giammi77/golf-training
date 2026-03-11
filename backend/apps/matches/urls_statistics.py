from django.urls import path
from . import views_statistics

urlpatterns = [
    path('points-trend/', views_statistics.PointsTrendView.as_view(), name='points-trend'),
    path('points-distribution/', views_statistics.PointsDistributionView.as_view(), name='points-distribution'),
]
