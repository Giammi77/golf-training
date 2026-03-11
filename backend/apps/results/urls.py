from django.urls import path
from . import views

urlpatterns = [
    path('', views.ResultListView.as_view(), name='result-list'),
    path('import/', views.ResultImportView.as_view(), name='result-import'),
    path('summary/', views.ResultSummaryView.as_view(), name='result-summary'),
]
