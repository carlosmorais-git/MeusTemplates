from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TechnologyViewSet, TemplateViewSet, ProjectViewSet,
    UserProgressViewSet, FavoriteViewSet, UserViewSet
)

# Configuração do router para as APIs
router = DefaultRouter()
router.register(r'technologies', TechnologyViewSet, basename='technology')
router.register(r'templates', TemplateViewSet, basename='template')
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'progress', UserProgressViewSet, basename='progress')
router.register(r'favorites', FavoriteViewSet, basename='favorite')
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('', include(router.urls)),
    # Expor as rotas de login/logout do browsable API em /api/api-auth/
    path('api-auth/', include('rest_framework.urls')),
]

