from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend
from django.http import HttpResponse, FileResponse
from django.conf import settings

import os
from django.utils.text import slugify

from .models import Template, CodeSnippet
from .serializers import (
    TemplateSerializer, TemplateListSerializer,
    TemplateStepSerializer, CodeSnippetSerializer,
)


class TemplateViewSet(viewsets.ModelViewSet):
    queryset = Template.objects.all()
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

    def get_queryset(self):
        user = getattr(self.request, 'user', None)
        # Se for listagem, retornar apenas templates do usuário autenticado.
        if self.action == 'list':
            if user and user.is_authenticated:
                return Template.objects.filter(created_by=user).order_by('-created_at')
            # visitantes veem apenas templates públicos
            return Template.objects.filter(is_public=True).order_by('-created_at')
        return super().get_queryset()

    @action(detail=True, methods=['get'])
    def export_markdown(self, request, pk=None):
        template = self.get_object()
        markdown_content = f"# {template.name}\n\n"
        markdown_content += f"**Tecnologia:** {template.technology}\n\n"
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

    @action(detail=True, methods=['post'], parser_classes=[MultiPartParser, FormParser], url_path='upload-file')
    def upload_file(self, request, pk=None):
        template = self.get_object()
        user = request.user
        if not user.is_authenticated:
            return Response({'detail': 'Autenticação necessária.'}, status=status.HTTP_401_UNAUTHORIZED)
        if template.created_by != user and not user.is_staff:
            return Response({'detail': 'Sem permissão para enviar arquivo para este template.'}, status=status.HTTP_403_FORBIDDEN)

        upload = request.FILES.get('file')
        if not upload:
            return Response({'detail': 'Arquivo não enviado. Use campo `file`.'}, status=status.HTTP_400_BAD_REQUEST)

        base = getattr(settings, 'BASE_DIR', None)
        if base is None:
            return Response({'detail': 'BASE_DIR não configurado.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        base_path = str(base)
        user_dir = os.path.join(base_path, 'user_data', str(user.username))
        os.makedirs(user_dir, exist_ok=True)

        _, ext = os.path.splitext(upload.name)
        filename = f"{slugify(template.technology)}-{slugify(template.name)}-v{template.version}{ext}"
        file_path = os.path.join(user_dir, filename)

        try:
            with open(file_path, 'wb+') as dest:
                for chunk in upload.chunks():
                    dest.write(chunk)
        except Exception as e:
            return Response({'detail': f'Erro ao salvar arquivo: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        template.file_path = file_path
        template.save()

        serializer = self.get_serializer(template)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'], url_path='download-file')
    def download_file(self, request, pk=None):
        template = self.get_object()
        if not template.file_path:
            return Response({'detail': 'Nenhum arquivo associado a este template.'}, status=status.HTTP_404_NOT_FOUND)
        if not os.path.exists(template.file_path):
            return Response({'detail': 'Arquivo não encontrado no disco.'}, status=status.HTTP_404_NOT_FOUND)

        try:
            f = open(template.file_path, 'rb')
            response = FileResponse(f, as_attachment=True, filename=os.path.basename(template.file_path))
            return response
        except Exception as e:
            return Response({'detail': f'Erro ao abrir arquivo: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
