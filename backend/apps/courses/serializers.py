from rest_framework import serializers
from .models import Hole, HcpStrokeAllocation


class HoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hole
        fields = ['id', 'nr_buca', 'denominazione', 'nr_colpi', 'distanza_t_rossi',
                  'distanza_t_gialli', 'hcp_buca', 'img']


class HcpStrokeAllocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = HcpStrokeAllocation
        fields = ['id', 'hole', 'hcp', 'da_hcp', 'a_hcp', 'colpi_aggiuntivi']
