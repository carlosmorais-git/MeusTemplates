from rest_framework import viewsets, status, filters, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth.models import User
from django.db.models import Q, Count
from django.http import HttpResponse
from django.template.loader import render_to_string

from .models import (
    Technology, Template, TemplateStep, Project, 
    ProjectResponse, CodeSnippet, UserProgress, Favorite
)
from .serializers import (
    TechnologySerializer, TemplateSerializer, TemplateListSerializer,
    TemplateStepSerializer, ProjectSerializer, ProjectListSerializer,
    ProjectResponseSerializer, CodeSnippetSerializer, 
    UserProgressSerializer, FavoriteSerializer, UserSerializer
)


class TechnologyViewSet(viewsets.ModelViewSet):
    """ViewSet para CRUD de tecnologias"""
    queryset = Technology.objects.all()
    serializer_class = TechnologySerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

   
    
    def get_permissions(self):
        return [AllowAny()]
    
    @action(detail=True, methods=['get'])
    def templates(self, request, pk=None):
        """Lista templates de uma tecnologia específica"""
        technology = self.get_object()
        templates = technology.templates.filter(is_public=True)
        serializer = TemplateListSerializer(templates, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def roadmap(self, request, pk=None):
        """Retorna um roadmap sugerido para a tecnologia"""
        technology = self.get_object()
        # Aqui você pode implementar lógica para sugerir uma sequência de templates
        templates = technology.templates.filter(is_public=True).order_by('created_at')
        serializer = TemplateListSerializer(templates, many=True, context={'request': request})
        return Response({
            'technology': TechnologySerializer(technology).data,
            'suggested_path': serializer.data
        })


class TemplateViewSet(viewsets.ModelViewSet):
    """ViewSet para templates de checklist"""
    queryset = Template.objects.filter(is_public=True)
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['technology', 'created_by']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at', 'updated_at']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return TemplateListSerializer
        return TemplateSerializer

    def get_permissions(self):
        # Todas as ações exigem autenticação
        return [AllowAny()]

    @action(detail=True, methods=['post'], permission_classes=[AllowAny])
    def favorite(self, request, pk=None):
        """Adiciona/remove template dos favoritos"""
        template = self.get_object()
        favorite, created = Favorite.objects.get_or_create(
            user=request.user, 
            template=template
        )
        
        if not created:
            favorite.delete()
            return Response({'favorited': False})
        
        return Response({'favorited': True})

    @action(detail=True, methods=['post'], permission_classes=[AllowAny])
    def start_project(self, request, pk=None):
        """Inicia um novo projeto baseado neste template"""
        template = self.get_object()
        project_name = request.data.get('name', f"Projeto {template.name}")
        project_description = request.data.get('description', '')
        project = Project.objects.create(
            user=request.user,
            template=template,
            name=project_name,
            description=project_description,
            status='draft'
        )
        serializer = ProjectSerializer(project, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def export_markdown(self, request, pk=None):
        """Exporta o template como um guia em Markdown"""
        template = self.get_object()
        
        # Gerar conteúdo Markdown
        markdown_content = f"# {template.name}\n\n"
        markdown_content += f"**Tecnologia:** {template.technology.name}\n\n"
        markdown_content += f"**Descrição:** {template.description}\n\n"
        markdown_content += "## Checklist\n\n"
        
        for step in template.steps.all():
            markdown_content += f"### {step.order}. {step.question}\n\n"
            if step.description:
                markdown_content += f"{step.description}\n\n"
            
            # Adicionar snippets de código se existirem
            for snippet in step.code_snippets.all():
                markdown_content += f"**{snippet.language.title()}:**\n"
                markdown_content += f"```{snippet.language}\n{snippet.code}\n```\n\n"
        
        response = HttpResponse(markdown_content, content_type='text/markdown')
        response['Content-Disposition'] = f'attachment; filename="{template.name}.md"'
        return response


class ProjectViewSet(viewsets.ModelViewSet):
    """ViewSet para projetos dos usuários"""
    serializer_class = ProjectSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'template__technology']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at', 'updated_at', 'progress_percentage']
    ordering = ['-updated_at']

    def get_queryset(self):
        return Project.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.action == 'list':
            return ProjectListSerializer
        return ProjectSerializer

    @action(detail=True, methods=['post'])
    def add_response(self, request, pk=None):
        """Adiciona uma resposta a uma etapa do projeto"""
        project = self.get_object()
        step_id = request.data.get('template_step_id')
        answer = request.data.get('answer')
        comment = request.data.get('comment', '')
        
        try:
            template_step = TemplateStep.objects.get(id=step_id, template=project.template)
        except TemplateStep.DoesNotExist:
            return Response(
                {'error': 'Etapa não encontrada'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        response_obj, created = ProjectResponse.objects.update_or_create(
            project=project,
            template_step=template_step,
            defaults={
                'answer': answer,
                'comment': comment,
                'is_completed': True
            }
        )
        
        # Recalcular progresso
        project.calculate_progress()
        
        serializer = ProjectResponseSerializer(response_obj)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def generate_guide(self, request, pk=None):
        """Gera um guia personalizado baseado nas respostas do usuário"""
        project = self.get_object()
        
        # Gerar conteúdo do guia
        guide_content = f"# Guia: {project.name}\n\n"
        guide_content += f"**Projeto:** {project.name}\n"
        guide_content += f"**Template:** {project.template.name}\n"
        guide_content += f"**Tecnologia:** {project.template.technology.name}\n"
        guide_content += f"**Status:** {project.get_status_display()}\n"
        guide_content += f"**Progresso:** {project.progress_percentage}%\n\n"
        
        if project.description:
            guide_content += f"**Descrição:** {project.description}\n\n"
        
        guide_content += "## Respostas do Checklist\n\n"
        
        for response in project.responses.all():
            step = response.template_step
            guide_content += f"### {step.order}. {step.question}\n\n"
            guide_content += f"**Resposta:** {response.answer}\n\n"
            
            if response.comment:
                guide_content += f"**Comentário:** {response.comment}\n\n"
            
            # Adicionar snippets relevantes
            for snippet in step.code_snippets.all():
                if snippet.is_example:
                    guide_content += f"**Exemplo em {snippet.language.title()}:**\n"
                    guide_content += f"```{snippet.language}\n{snippet.code}\n```\n\n"
        
        guide_content += "---\n\n"
        guide_content += f"*Guia gerado automaticamente em {project.updated_at.strftime('%d/%m/%Y às %H:%M')}*\n"
        
        return Response({
            'project': ProjectSerializer(project, context={'request': request}).data,
            'guide_markdown': guide_content
        })

    @action(detail=True, methods=['get'])
    def export_guide(self, request, pk=None):
        """Exporta o guia como arquivo Markdown"""
        project = self.get_object()
        guide_data = self.generate_guide(request, pk)
        
        response = HttpResponse(
            guide_data.data['guide_markdown'], 
            content_type='text/markdown'
        )
        response['Content-Disposition'] = f'attachment; filename="guia_{project.name}.md"'
        return response


class UserProgressViewSet(viewsets.ModelViewSet):
    """ViewSet para progresso dos usuários"""
    serializer_class = UserProgressSerializer
    permission_classes = [AllowAny]  # Temporário para desenvolvimento

    def get_queryset(self):
        # Só retorna progresso do usuário autenticado
        return UserProgress.objects.filter(user=self.request.user)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def dashboard(self, request):
        """Dashboard com estatísticas do usuário autenticado"""
        user = request.user
        # Estatísticas gerais
        total_projects = Project.objects.filter(user=user).count()
        completed_projects = Project.objects.filter(user=user, status='completed').count()
        technologies_used = Technology.objects.filter(
            templates__projects__user=user
        ).distinct().count()
        # Progresso por tecnologia
        progress_by_tech = UserProgress.objects.filter(user=user)
        # Projetos recentes
        recent_projects = Project.objects.filter(user=user).order_by('-updated_at')[:5]
        # Templates favoritos
        favorite_templates = Template.objects.filter(favorited_by__user=user)
        return Response({
            'stats': {
                'total_projects': total_projects,
                'completed_projects': completed_projects,
                'technologies_used': technologies_used,
                'completion_rate': (completed_projects / total_projects * 100) if total_projects > 0 else 0
            },
            'progress_by_technology': UserProgressSerializer(progress_by_tech, many=True).data,
            'recent_projects': ProjectListSerializer(recent_projects, many=True, context={'request': request}).data,
            'favorite_templates': TemplateListSerializer(favorite_templates, many=True, context={'request': request}).data
        })


class FavoriteViewSet(viewsets.ModelViewSet):
    """ViewSet para templates favoritos"""
    serializer_class = FavoriteSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user)


# Views auxiliares
class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para informações do usuário"""
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return User.objects.filter(id=self.request.user.id)

