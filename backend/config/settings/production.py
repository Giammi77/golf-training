"""
Production settings.
"""
from .base import *  # noqa: F401, F403

DEBUG = False

ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '').split(',')

CORS_ALLOWED_ORIGINS = os.environ.get('CORS_ALLOWED_ORIGINS', '').split(',')

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME', 'golf'),
        'USER': os.environ.get('DB_USER', 'postgres'),
        'PASSWORD': os.environ.get('DB_PASSWORD', ''),
        'HOST': os.environ.get('DB_HOST', 'db'),
        'PORT': os.environ.get('DB_PORT', '5432'),
    },
    'genropy': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('GENROPY_DB_NAME', 'exercise'),
        'USER': os.environ.get('GENROPY_DB_USER', os.environ.get('DB_USER', 'postgres')),
        'PASSWORD': os.environ.get('GENROPY_DB_PASSWORD', os.environ.get('DB_PASSWORD', '')),
        'HOST': os.environ.get('GENROPY_DB_HOST', os.environ.get('DB_HOST', 'db')),
        'PORT': os.environ.get('GENROPY_DB_PORT', os.environ.get('DB_PORT', '5432')),
    },
}

# Security
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
