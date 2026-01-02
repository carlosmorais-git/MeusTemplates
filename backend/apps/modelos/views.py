from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.http import HttpResponse

from .models import Technology, Template, CodeSnippet
from .serializers import (
    TechnologySerializer, TemplateSerializer, TemplateListSerializer,
    TemplateStepSerializer, CodeSnippetSerializer, FavoriteSerializer
)
from .models import Favorite


class TechnologyViewSet(viewsets.ModelViewSet):
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
        technology = self.get_object()
        templates = technology.templates.filter(is_public=True)
        serializer = TemplateListSerializer(templates, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def roadmap(self, request, pk=None):
        technology = self.get_object()
        templates = technology.templates.filter(is_public=True).order_by('created_at')
        serializer = TemplateListSerializer(templates, many=True, context={'request': request})
        return Response({'technology': TechnologySerializer(technology).data, 'suggested_path': serializer.data})


class TemplateViewSet(viewsets.ModelViewSet):
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
        return [AllowAny()]

    @action(detail=True, methods=['post'], permission_classes=[AllowAny])
    def favorite(self, request, pk=None):
        template = self.get_object()
        favorite, created = Favorite.objects.get_or_create(user=request.user, template=template)
        if not created:
            favorite.delete()
            return Response({'favorited': False})
        return Response({'favorited': True})

    @action(detail=True, methods=['get'])
    def export_markdown(self, request, pk=None):
        template = self.get_object()
        markdown_content = f"# {template.name}\n\n"
        markdown_content += f"**Tecnologia:** {template.technology.name}\n\n"
        markdown_content += f"**Descrição:** {template.description}\n\n"
        markdown_content += "## Checklist\n\n"
        for step in template.steps.all():
            markdown_content += f"### {step.order}. {step.question}\n\n"
            if step.description:
                markdown_content += f"{step.description}\n\n"
            for snippet in step.code_snippets.all():
                markdown_content += f"**{snippet.language.title()}:**\n"
                markdown_content += f"```{snippet.language}\n{snippet.code}\n```\n\n"
        response = HttpResponse(markdown_content, content_type='text/markdown')
        response['Content-Disposition'] = f'attachment; filename="{template.name}.md"'
        return response


class FavoriteViewSet(viewsets.ModelViewSet):
    serializer_class = FavoriteSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user)
