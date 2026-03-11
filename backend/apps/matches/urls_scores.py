from django.urls import path
from . import views_scores

urlpatterns = [
    path('<int:pk>/increment/', views_scores.IncrementStrokeView.as_view(), name='score-increment'),
    path('<int:pk>/decrement/', views_scores.DecrementStrokeView.as_view(), name='score-decrement'),
    path('finish/', views_scores.FinishMatchView.as_view(), name='score-finish'),
]
