from rest_framework import serializers
from .models import User, GolferProfile


class GolferProfileSerializer(serializers.ModelSerializer):
    nominativo = serializers.CharField(read_only=True)

    class Meta:
        model = GolferProfile
        fields = ['id', 'nr_tessera', 'hcp', 'img', 'nominativo']
        read_only_fields = ['id']


class UserSerializer(serializers.ModelSerializer):
    golfer_profile = GolferProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'golfer_profile']
        read_only_fields = ['id', 'username']


class MeSerializer(serializers.ModelSerializer):
    """Serializer for the /me endpoint with golfer profile."""
    golfer_profile = GolferProfileSerializer(required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'golfer_profile']
        read_only_fields = ['id', 'username']

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('golfer_profile', None)
        instance = super().update(instance, validated_data)
        if profile_data is not None:
            profile, _ = GolferProfile.objects.get_or_create(user=instance)
            for attr, value in profile_data.items():
                setattr(profile, attr, value)
            profile.save()
        return instance
