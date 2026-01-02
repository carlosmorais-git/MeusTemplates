from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import UserProgress
from apps.modelos.serializers import TechnologySerializer


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined']
        read_only_fields = ['id', 'date_joined']


class UserProgressSerializer(serializers.ModelSerializer):
    technology = TechnologySerializer(read_only=True)
    technology_id = serializers.IntegerField(write_only=True)
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserProgress
        fields = ['id', 'user', 'technology', 'technology_id', 'projects_completed', 'total_hours', 'level', 'badges', 'last_activity']
        read_only_fields = ['id', 'user', 'last_activity']

