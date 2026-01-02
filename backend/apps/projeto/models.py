from django.db import models
from django.conf import settings


class Project(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Rascunho'),
        ('in_progress', 'Em Progresso'),
        ('completed', 'Concluído'),
        ('archived', 'Arquivado'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='projects')
    template = models.ForeignKey('modelos.Template', on_delete=models.CASCADE, related_name='projects')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    progress_percentage = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.user.username} - {self.name}"

    def calculate_progress(self):
        total_steps = self.template.steps.filter(is_required=True).count()
        completed_steps = self.responses.filter(is_completed=True).count()
        if total_steps > 0:
            self.progress_percentage = int((completed_steps / total_steps) * 100)
        else:
            self.progress_percentage = 0
        self.save()
        return self.progress_percentage


class ProjectResponse(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='responses')
    template_step = models.ForeignKey('modelos.TemplateStep', on_delete=models.CASCADE)
    answer = models.TextField()
    comment = models.TextField(blank=True)
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['project', 'template_step']
        ordering = ['template_step__order']

    def __str__(self):
        return f"{self.project.name} - {self.template_step.question[:30]}"
