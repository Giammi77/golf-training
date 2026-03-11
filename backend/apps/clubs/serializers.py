from rest_framework import serializers
from .models import Club


class ClubSerializer(serializers.ModelSerializer):
    class Meta:
        model = Club
        fields = ['id', 'ragione_sociale', 'indirizzo', 'localita', 'provincia',
                  'email', 'telefono', 'www', 'logo', 'hcp_max']


class ClubListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for club selection dropdown."""
    class Meta:
        model = Club
        fields = ['id', 'ragione_sociale']
