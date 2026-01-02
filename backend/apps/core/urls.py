from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserProgressViewSet, UserViewSet

router = DefaultRouter()
router.register(r'progress', UserProgressViewSet, basename='progress')
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('', include(router.urls)),
    path('api-auth/', include('rest_framework.urls')),
]

