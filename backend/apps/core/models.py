from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator


class Technology(models.Model):
    """Tecnologias disponíveis no sistema (Django, React Native, etc.)"""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    icon = models.CharField(max_length=10, help_text="Emoji ou ícone representativo")
    color = models.CharField(max_length=7, help_text="Cor em hexadecimal (#FF0000)")
    documentation_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Garantir que cada etapa tenha apenas uma resposta por projeto
    class Meta:
        verbose_name_plural = "Technologies" # Correção do plural
        ordering = ['name'] # Ordena por nome
    
    def __str__(self):
        return f"{self.icon} {self.name}"


class Template(models.Model):
    """Templates de checklist para diferentes tecnologias"""
    technology = models.ForeignKey(Technology, on_delete=models.CASCADE, related_name='templates')
    name = models.CharField(max_length=200)
    description = models.TextField()
    version = models.CharField(max_length=20, default="1.0")
    is_public = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_templates')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ['technology', 'name', 'version']
    
    def __str__(self):
        return f"{self.technology.name} - {self.name} v{self.version}"


class TemplateStep(models.Model):
    """Etapas/perguntas de um template"""
    STEP_TYPES = [
        ('boolean', 'Sim/Não'),
        ('text', 'Texto'),
        ('choice', 'Múltipla Escolha'),
        ('code', 'Código'),
        ('number', 'Número'),
    ]
    
    template = models.ForeignKey(Template, on_delete=models.CASCADE, related_name='steps')
    question = models.CharField(max_length=500)
    description = models.TextField(blank=True, help_text="Descrição detalhada da etapa")
    step_type = models.CharField(max_length=20, choices=STEP_TYPES, default='boolean')
    is_required = models.BooleanField(default=True)
    order = models.PositiveIntegerField()
    parent_step = models.ForeignKey('self', on_delete=models.CASCADE, blank=True, null=True, 
                                   help_text="Etapa pai para perguntas condicionais")
    condition_value = models.CharField(max_length=200, blank=True, 
                                     help_text="Valor que ativa esta etapa")
    choices = models.JSONField(blank=True, null=True, 
                              help_text="Opções para step_type='choice'")
    
    class Meta:
        ordering = ['order']
        unique_together = ['template', 'order']
    
    def __str__(self):
        return f"{self.template.name} - Etapa {self.order}: {self.question[:50]}"


class Project(models.Model):
    """Projetos dos usuários baseados em templates"""
    STATUS_CHOICES = [
        ('draft', 'Rascunho'),
        ('in_progress', 'Em Progresso'),
        ('completed', 'Concluído'),
        ('archived', 'Arquivado'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='projects')
    template = models.ForeignKey(Template, on_delete=models.CASCADE, related_name='projects')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    progress_percentage = models.PositiveIntegerField(
        default=0, 
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.name}"
    
    def calculate_progress(self):
        """Calcula o progresso baseado nas respostas completadas"""
        total_steps = self.template.steps.filter(is_required=True).count()
        completed_steps = self.responses.filter(is_completed=True).count()
        
        if total_steps > 0:
            self.progress_percentage = int((completed_steps / total_steps) * 100)
        else:
            self.progress_percentage = 0
        
        self.save()
        return self.progress_percentage


class ProjectResponse(models.Model):
    """Respostas do usuário para cada etapa do template"""
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='responses')
    template_step = models.ForeignKey(TemplateStep, on_delete=models.CASCADE)
    answer = models.TextField()
    comment = models.TextField(blank=True, help_text="Comentário adicional do usuário")
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Garantir que cada etapa tenha apenas uma resposta por projeto
    class Meta:
        unique_together = ['project', 'template_step'] # Cada etapa só pode ter uma resposta por projeto
        ordering = ['template_step__order'] # Ordena pela ordem da etapa no template
    
    def __str__(self):
        return f"{self.project.name} - {self.template_step.question[:30]}"


class CodeSnippet(models.Model):
    """Snippets de código relacionados às etapas dos templates"""
    template_step = models.ForeignKey(TemplateStep, on_delete=models.CASCADE, related_name='code_snippets')
    language = models.CharField(max_length=50, help_text="python, javascript, etc.")
    code = models.TextField()
    description = models.TextField(blank=True)
    is_example = models.BooleanField(default=True, help_text="Se é um exemplo ou template")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['language', 'created_at']
    
    def __str__(self):
        return f"{self.language} - {self.template_step.question[:30]}"


class UserProgress(models.Model):
    """Progresso e estatísticas do usuário por tecnologia"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='progress')
    technology = models.ForeignKey(Technology, on_delete=models.CASCADE)
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
        # Nível = projetos_completados // 3 + 1
        new_level = (self.projects_completed // 3) + 1
        if new_level != self.level:
            self.level = new_level
            self.save()
        return self.level


class Favorite(models.Model):
    """Templates favoritos dos usuários"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    template = models.ForeignKey(Template, on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'template']
        ordering = ['-created_at'] # Mais recentes primeiro
    
    def __str__(self):
        return f"{self.user.username} ❤️ {self.template.name}"

