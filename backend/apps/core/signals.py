import os
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model

User = get_user_model()

@receiver(post_save, sender=User)
def create_user_folder(sender, instance, created, **kwargs):
    if not created:
        return

    base = getattr(settings, 'BASE_DIR', None)
    if base is None:
        return

    # BASE_DIR can be a Path; convert to str
    base_path = str(base)
    user_dir = os.path.join(base_path, 'user_data', str(instance.username))

    try:
        os.makedirs(user_dir, exist_ok=True)
    except Exception:
        # Não falhar o processo de criação do usuário se não puder criar a pasta
        pass
