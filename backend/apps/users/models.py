from django.contrib.auth.models import AbstractUser
from django.db import models


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
