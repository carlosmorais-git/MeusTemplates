from django.db import models
from django.conf import settings


class Technology(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    icon = models.CharField(max_length=10, help_text="Emoji ou ícone representativo")
    color = models.CharField(max_length=7, help_text="Cor em hexadecimal (#FF0000)")
    documentation_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Technologies"
        ordering = ['name']

    def __str__(self):
        return f"{self.icon} {self.name}"


class Template(models.Model):
    technology = models.ForeignKey(Technology, on_delete=models.CASCADE, related_name='templates')
    name = models.CharField(max_length=200)
    description = models.TextField()
    version = models.CharField(max_length=20, default="1.0")
    is_public = models.BooleanField(default=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_templates')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ['technology', 'name', 'version']

    def __str__(self):
        return f"{self.technology.name} - {self.name} v{self.version}"


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


class Favorite(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='favorites')
    template = models.ForeignKey(Template, on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'template']
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} ❤️ {self.template.name}"
