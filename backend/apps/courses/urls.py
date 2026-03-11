from django.urls import path
from . import views

urlpatterns = [
    path('', views.HoleListView.as_view(), name='hole-list'),
]
