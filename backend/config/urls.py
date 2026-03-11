from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('apps.users.urls')),
    path('api/v1/clubs/', include('apps.clubs.urls')),
    path('api/v1/courses/', include('apps.courses.urls')),
    path('api/v1/matches/', include('apps.matches.urls')),
    path('api/v1/scores/', include('apps.matches.urls_scores')),
    path('api/v1/history/', include('apps.matches.urls_history')),
    path('api/v1/statistics/', include('apps.matches.urls_statistics')),
    path('api/v1/results/', include('apps.results.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
