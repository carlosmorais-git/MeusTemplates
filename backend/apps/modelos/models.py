from django.db import models
from django.conf import settings


class Template(models.Model):
    technology = models.CharField(max_length=100)
    name = models.CharField(max_length=200)
    description = models.TextField()
    version = models.CharField(max_length=20, default="1.0")
    is_public = models.BooleanField(default=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_templates')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    file_path = models.CharField(max_length=500, blank=True, null=True, help_text='Caminho local do arquivo do template (opcional)')

    class Meta:
        ordering = ['-created_at']
        unique_together = ['technology', 'name', 'version']

    def __str__(self):
        return f"{self.technology} - {self.name} v{self.version}"


class TemplateStep(models.Model):
    STEP_TYPES = [
        ('boolean', 'Sim/Não'),
        ('text', 'Texto'),
        ('choice', 'Múltipla Escolha'),
        ('code', 'Código'),
        ('number', 'Número'),
    ]

    template = models.ForeignKey(Template, on_delete=models.CASCADE, related_name='steps')
    question = models.CharField(max_length=500)
    description = models.TextField(blank=True)
    step_type = models.CharField(max_length=20, choices=STEP_TYPES, default='boolean')
    is_required = models.BooleanField(default=True)
    order = models.PositiveIntegerField()
    parent_step = models.ForeignKey('self', on_delete=models.CASCADE, blank=True, null=True)
    condition_value = models.CharField(max_length=200, blank=True)
    choices = models.JSONField(blank=True, null=True)

    class Meta:
        ordering = ['order']
        unique_together = ['template', 'order']

    def __str__(self):
        return f"{self.template.name} - Etapa {self.order}: {self.question[:50]}"


class CodeSnippet(models.Model):
    template_step = models.ForeignKey(TemplateStep, on_delete=models.CASCADE, related_name='code_snippets')
    language = models.CharField(max_length=50)
    code = models.TextField()
    description = models.TextField(blank=True)
    is_example = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['language', 'created_at']

    def __str__(self):
        return f"{self.language} - {self.template_step.question[:30]}"

