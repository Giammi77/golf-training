from rest_framework import serializers
from .models import OfficialResult


class OfficialResultSerializer(serializers.ModelSerializer):
    row_style = serializers.SerializerMethodField()

    class Meta:
        model = OfficialResult
        fields = ['id', 'data', 'tesserato', 'numero_tessera', 'gara', 'processo',
                  'motivazione_variazione', 'esecutore', 'giro', 'formula', 'buche',
                  'valida', 'playing_hcp', 'par', 'cr', 'sr', 'stbl', 'ags', 'pcc',
                  'sd', 'corr_sd', 'corr', 'index_vecchio', 'index_nuovo', 'variazione',
                  'row_count', 'row_style']

    def get_row_style(self, obj):
        """Return row highlighting class based on SD values."""
        best_8_data = self.context.get('best_8_data')
        if not best_8_data:
            return None

        if obj.sd is not None and best_8_data.get('l_sd') is not None:
            if float(obj.sd) == best_8_data['l_sd']:
                return 'best'  # green - lowest SD
            if float(obj.sd) == best_8_data['h_sd']:
                return 'worst'  # red - highest SD
            if obj.id in best_8_data.get('best_8_ids', set()):
                return 'average'  # bold - part of best 8
        return None


class ResultSummarySerializer(serializers.Serializer):
    h_sd = serializers.FloatField(allow_null=True)
    l_sd = serializers.FloatField(allow_null=True)
    c_sd_avg = serializers.FloatField(allow_null=True)
