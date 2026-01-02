from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model

from .models import UserProgress
from .serializers import UserSerializer, UserProgressSerializer


class UserProgressViewSet(viewsets.ModelViewSet):
    serializer_class = UserProgressSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return UserProgress.objects.filter(user=self.request.user)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def dashboard(self, request):
        user = request.user
        try:
            from apps.projeto.models import Project
            from apps.modelos.models import Template
        except Exception:
            Project = None
            Template = None

        total_projects = Project.objects.filter(user=user).count() if Project else 0
        completed_projects = Project.objects.filter(user=user, status='completed').count() if Project else 0
        technologies_used = 0
        if Template:
            technologies_used = Template.objects.filter(favorited_by__user=user).values('technology').distinct().count()

        progress_by_tech = UserProgress.objects.filter(user=user)

        recent_projects = Project.objects.filter(user=user).order_by('-updated_at')[:5] if Project else []
        favorite_templates = Template.objects.filter(favorited_by__user=user) if Template else []

        return Response({
            'stats': {
                'total_projects': total_projects,
                'completed_projects': completed_projects,
                'technologies_used': technologies_used,
                'completion_rate': (completed_projects / total_projects * 100) if total_projects > 0 else 0
            },
            'progress_by_technology': UserProgressSerializer(progress_by_tech, many=True).data,
            'recent_projects': [{'id': p.id, 'name': p.name} for p in recent_projects],
            'favorite_templates': [{'id': t.id, 'name': t.name} for t in favorite_templates]
        })


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        User = get_user_model()
        return User.objects.filter(id=self.request.user.id)

