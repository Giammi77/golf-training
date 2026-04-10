import secrets
from datetime import timedelta
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class User(AbstractUser):
    """Custom user model extending Django's AbstractUser."""

    class Meta:
        db_table = 'golf_user'

    def __str__(self):
        return f"{self.first_name} {self.last_name}".strip() or self.username


class GolferProfile(models.Model):
    """Golfer profile linked to a user account. Maps to glf.anagrafica."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='golfer_profile')
    nr_tessera = models.CharField('Tessera Nr.', max_length=50, blank=True, default='')
    hcp = models.DecimalField('Handicap', max_digits=5, decimal_places=1, default=54)
    img = models.ImageField('Immagine', upload_to='golfers/', blank=True, null=True)
    legacy_id = models.CharField(max_length=22, blank=True, null=True, db_index=True)

    class Meta:
        db_table = 'golf_golfer_profile'
        verbose_name = 'Profilo Golfista'
        verbose_name_plural = 'Profili Golfisti'

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} Hcp {self.hcp}"

    @property
    def nominativo(self):
        return f"{self.user.first_name} {self.user.last_name} Hcp {self.hcp}"


class PasswordResetToken(models.Model):
    """One-time token used by admin-generated password reset links."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='password_reset_tokens')
    token = models.CharField(max_length=64, unique=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    used_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'golf_password_reset_token'

    @classmethod
    def create_for_user(cls, user):
        return cls.objects.create(user=user, token=secrets.token_urlsafe(32))

    def is_valid(self):
        if self.used_at is not None:
            return False
        return timezone.now() - self.created_at < timedelta(hours=24)

    def mark_used(self):
        self.used_at = timezone.now()
        self.save(update_fields=['used_at'])
