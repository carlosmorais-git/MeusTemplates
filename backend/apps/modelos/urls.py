from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TechnologyViewSet, TemplateViewSet, FavoriteViewSet

router = DefaultRouter()
router.register(r'technologies', TechnologyViewSet, basename='technology')
router.register(r'templates', TemplateViewSet, basename='template')
router.register(r'favorites', FavoriteViewSet, basename='favorite')

urlpatterns = [
    path('', include(router.urls)),
]
