from django.contrib.auth.password_validation import validate_password
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
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'is_staff', 'golfer_profile']
        read_only_fields = ['id', 'username', 'is_staff']

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('golfer_profile', None)
        instance = super().update(instance, validated_data)
        if profile_data is not None:
            profile, _ = GolferProfile.objects.get_or_create(user=instance)
            for attr, value in profile_data.items():
                setattr(profile, attr, value)
            profile.save()
        return instance


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Password attuale non corretta.')
        return value

    def validate_new_password(self, value):
        validate_password(value, self.context['request'].user)
        return value


class AdminGolferSerializer(serializers.ModelSerializer):
    golfer_profile = GolferProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'golfer_profile']
        read_only_fields = fields


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, min_length=6)
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    email = serializers.EmailField(required=False, allow_blank=True)
    nr_tessera = serializers.CharField(max_length=50, required=False, allow_blank=True)
    hcp = serializers.DecimalField(max_digits=5, decimal_places=1, required=False, default=54)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('Username gia\' in uso.')
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        nr_tessera = validated_data.pop('nr_tessera', '')
        hcp = validated_data.pop('hcp', 54)

        user = User(
            username=validated_data['username'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            email=validated_data.get('email', ''),
        )
        user.set_password(password)
        user.save()

        GolferProfile.objects.create(user=user, nr_tessera=nr_tessera, hcp=hcp)
        return user
