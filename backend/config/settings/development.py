"""
Development settings.
"""
from .base import *  # noqa: F401, F403

DEBUG = True

ALLOWED_HOSTS = ['*']

# CORS - allow React dev server
CORS_ALLOW_ALL_ORIGINS = True

# Database - connects to same PostgreSQL as GenroPy, uses 'golf' schema
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME', 'golf'),
        'USER': os.environ.get('DB_USER', 'gianmaria'),
        'PASSWORD': os.environ.get('DB_PASSWORD', ''),
        'HOST': os.environ.get('DB_HOST', 'localhost'),
        'PORT': os.environ.get('DB_PORT', '5432'),
    },
    # Database GenroPy sorgente per la migrazione dati
    'genropy': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('GENROPY_DB_NAME', 'exercise'),
        'USER': os.environ.get('GENROPY_DB_USER', 'gianmaria'),
        'PASSWORD': os.environ.get('GENROPY_DB_PASSWORD', ''),
        'HOST': os.environ.get('GENROPY_DB_HOST', 'localhost'),
        'PORT': os.environ.get('GENROPY_DB_PORT', '5432'),
    },
}
