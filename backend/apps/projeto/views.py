from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.http import HttpResponse

from .models import Project, ProjectResponse
from .serializers import ProjectSerializer, ProjectListSerializer, ProjectResponseSerializer


class ProjectViewSet(viewsets.ModelViewSet):
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
        project = self.get_object()
        step_id = request.data.get('template_step_id')
        answer = request.data.get('answer')
        comment = request.data.get('comment', '')
        try:
            from apps.modelos.models import TemplateStep
            template_step = TemplateStep.objects.get(id=step_id, template=project.template)
        except TemplateStep.DoesNotExist:
            return Response({'error': 'Etapa não encontrada'}, status=status.HTTP_404_NOT_FOUND)

        response_obj, created = ProjectResponse.objects.update_or_create(
            project=project,
            template_step=template_step,
            defaults={'answer': answer, 'comment': comment, 'is_completed': True}
        )
        project.calculate_progress()
        serializer = ProjectResponseSerializer(response_obj)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def generate_guide(self, request, pk=None):
        project = self.get_object()
        guide_content = f"# Guia: {project.name}\n\n"
        guide_content += f"**Projeto:** {project.name}\n"
        guide_content += f"**Template:** {project.template.name}\n"
        guide_content += f"**Tecnologia:** {project.template.technology.name}\n"
        guide_content += f"**Status:** {project.status}\n"
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

            for snippet in step.code_snippets.all():
                if snippet.is_example:
                    guide_content += f"**Exemplo em {snippet.language.title()}:**\n"
                    guide_content += f"```{snippet.language}\n{snippet.code}\n```\n\n"

        guide_content += "---\n\n"
        guide_content += f"*Guia gerado automaticamente*\n"

        return Response({'project': ProjectSerializer(project, context={'request': request}).data, 'guide_markdown': guide_content})

    @action(detail=True, methods=['get'])
    def export_guide(self, request, pk=None):
        project = self.get_object()
        guide_data = self.generate_guide(request, pk)
        response = HttpResponse(guide_data.data['guide_markdown'], content_type='text/markdown')
        response['Content-Disposition'] = f'attachment; filename="guia_{project.name}.md"'
        return response
