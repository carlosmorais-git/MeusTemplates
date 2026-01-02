from django.apps import AppConfig


class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.core'
    verbose_name = 'Core'
    
    def ready(self):
        # Importa sinais para criar pasta do usuário ao ser criado
        try:
            from . import signals  # noqa: F401
        except Exception:
            pass
