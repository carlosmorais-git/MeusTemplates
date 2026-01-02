from django.db import models
from django.conf import settings


class UserProgress(models.Model):
    """Progresso e estatísticas do usuário por tecnologia"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='progress')
    technology = models.ForeignKey('modelos.Technology', on_delete=models.CASCADE)
    projects_completed = models.PositiveIntegerField(default=0)
    total_hours = models.PositiveIntegerField(default=0, help_text="Horas estimadas estudadas")
    level = models.PositiveIntegerField(default=1)
    badges = models.JSONField(default=list, help_text="Lista de badges conquistadas")
    last_activity = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'technology']
        ordering = ['-last_activity']

    def __str__(self):
        return f"{self.user.username} - {self.technology.name} (Nível {self.level})"

    def add_badge(self, badge_name):
        """Adiciona uma badge se ainda não foi conquistada"""
        if badge_name not in self.badges:
            self.badges.append(badge_name)
            self.save()

    def calculate_level(self):
        """Calcula o nível baseado nos projetos completados"""
        new_level = (self.projects_completed // 3) + 1
        if new_level != self.level:
            self.level = new_level
            self.save()
        return self.level

