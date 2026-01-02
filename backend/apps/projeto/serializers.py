from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Project, ProjectResponse
from apps.modelos.serializers import TemplateSerializer, TemplateListSerializer, TemplateStepSerializer


class ProjectResponseSerializer(serializers.ModelSerializer):
    template_step = TemplateStepSerializer(read_only=True)
    template_step_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = ProjectResponse
        fields = ['id', 'template_step', 'template_step_id', 'answer', 'comment', 'is_completed', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ProjectSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    template = TemplateSerializer(read_only=True)
    template_id = serializers.IntegerField(write_only=True)
    responses = ProjectResponseSerializer(many=True, read_only=True)
    responses_count = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = ['id', 'user', 'template', 'template_id', 'name', 'description', 'status', 'progress_percentage', 'created_at', 'updated_at', 'responses', 'responses_count']
        read_only_fields = ['id', 'created_at', 'updated_at', 'user', 'progress_percentage']

    def get_user(self, obj):
        return {'id': obj.user.id, 'username': obj.user.username}

    def get_responses_count(self, obj):
        return obj.responses.count()

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['user'] = request.user
        return super().create(validated_data)


class ProjectListSerializer(serializers.ModelSerializer):
    template = TemplateListSerializer(read_only=True)

    class Meta:
        model = Project
        fields = ['id', 'template', 'name', 'description', 'status', 'progress_percentage', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'progress_percentage']
