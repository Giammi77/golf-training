from rest_framework import generics, views, status, parsers
from rest_framework.response import Response
from .models import OfficialResult
from .serializers import OfficialResultSerializer, ResultSummarySerializer
from . import services


class ResultListView(generics.ListAPIView):
    """
    GET /api/v1/results/?section=all|last20|best8
    List official results for the current user.
    """
    serializer_class = OfficialResultSerializer
    pagination_class = None

    def get_queryset(self):
        user = self.request.user
        section = self.request.query_params.get('section', 'all')
        qs = OfficialResult.objects.filter(user=user)

        if section == 'last20':
            row_max = qs.order_by('-row_count').values_list('row_count', flat=True).first() or 0
            qs = qs.filter(row_count__gt=row_max - 20).order_by('-row_count')
        elif section == 'best8':
            best_8_data = services.calculate_best_8(user)
            qs = qs.filter(id__in=best_8_data['best_8_ids']).order_by('-sd')
        else:
            qs = qs.order_by('-row_count')

        return qs

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['best_8_data'] = services.calculate_best_8(self.request.user)
        return ctx


class ResultImportView(views.APIView):
    """POST /api/v1/results/import/ - Upload HTML/Excel file with results."""
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    def post(self, request):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response(
                {'error': 'Nessun file fornito'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            count = services.import_results_file(file_obj, request.user)
            return Response({
                'message': f'Importati {count} risultati con successo',
                'count': count,
            })
        except Exception as e:
            return Response(
                {'error': f'Errore durante l\'importazione: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST,
            )


class ResultSummaryView(views.APIView):
    """GET /api/v1/results/summary/ - h_sd, l_sd, c_sd_avg."""

    def get(self, request):
        data = services.calculate_best_8(request.user)
        serializer = ResultSummarySerializer(data)
        return Response(serializer.data)
