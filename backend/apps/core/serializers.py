from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Technology, Template, TemplateStep, Project, 
    ProjectResponse, CodeSnippet, UserProgress, Favorite
)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined']
        read_only_fields = ['id', 'date_joined']


class TechnologySerializer(serializers.ModelSerializer):
    templates_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Technology
        fields = ['id', 'name', 'description', 'icon', 'color', 
                 'documentation_url', 'created_at', 'templates_count']
        read_only_fields = ['id', 'created_at', 'templates_count']
    
    def get_templates_count(self, obj):
        return obj.templates.filter(is_public=True).count()


class CodeSnippetSerializer(serializers.ModelSerializer):
    class Meta:
        model = CodeSnippet
        fields = ['id', 'language', 'code', 'description', 'is_example', 'created_at']
        read_only_fields = ['id', 'created_at']


class TemplateStepSerializer(serializers.ModelSerializer):
    code_snippets = CodeSnippetSerializer(many=True, read_only=True)
    
    class Meta:
        model = TemplateStep
        fields = ['id', 'question', 'description', 'step_type', 'is_required', 
                 'order', 'parent_step', 'condition_value', 'choices', 'code_snippets']
        read_only_fields = ['id']


class TemplateSerializer(serializers.ModelSerializer):
    technology = TechnologySerializer(read_only=True)
    technology_id = serializers.IntegerField(write_only=True)
    created_by = UserSerializer(read_only=True)
    steps = TemplateStepSerializer(many=True, read_only=True)
    steps_count = serializers.SerializerMethodField()
    is_favorited = serializers.SerializerMethodField()
    
    class Meta:
        model = Template
        fields = ['id', 'technology', 'technology_id', 'name', 'description', 
                 'version', 'is_public', 'created_by', 'created_at', 'updated_at',
                 'steps', 'steps_count', 'is_favorited']
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by']
    
    def get_steps_count(self, obj):
        return obj.steps.count()
    
    def get_is_favorited(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.favorited_by.filter(user=request.user).exists()
        return False
    
    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['created_by'] = request.user
        return super().create(validated_data)


class ProjectResponseSerializer(serializers.ModelSerializer):
    template_step = TemplateStepSerializer(read_only=True)
    template_step_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = ProjectResponse
        fields = ['id', 'template_step', 'template_step_id', 'answer', 
                 'comment', 'is_completed', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ProjectSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    template = TemplateSerializer(read_only=True)
    template_id = serializers.IntegerField(write_only=True)
    responses = ProjectResponseSerializer(many=True, read_only=True)
    responses_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = ['id', 'user', 'template', 'template_id', 'name', 'description', 
                 'status', 'progress_percentage', 'created_at', 'updated_at',
                 'responses', 'responses_count']
        read_only_fields = ['id', 'created_at', 'updated_at', 'user', 'progress_percentage']
    
    def get_responses_count(self, obj):
        return obj.responses.count()
    
    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['user'] = request.user
        return super().create(validated_data)


class UserProgressSerializer(serializers.ModelSerializer):
    technology = TechnologySerializer(read_only=True)
    technology_id = serializers.IntegerField(write_only=True)
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = UserProgress
        fields = ['id', 'user', 'technology', 'technology_id', 'projects_completed',
                 'total_hours', 'level', 'badges', 'last_activity']
        read_only_fields = ['id', 'user', 'last_activity']


class FavoriteSerializer(serializers.ModelSerializer):
    template = TemplateSerializer(read_only=True)
    template_id = serializers.IntegerField(write_only=True)
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Favorite
        fields = ['id', 'user', 'template', 'template_id', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']
    
    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['user'] = request.user
        return super().create(validated_data)


# Serializers simplificados para listagens
class TemplateListSerializer(serializers.ModelSerializer):
    technology = TechnologySerializer(read_only=True)
    created_by = UserSerializer(read_only=True)
    steps_count = serializers.SerializerMethodField()
    is_favorited = serializers.SerializerMethodField()
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = Template
        fields = ['id', 'technology', 'name', 'created_by_username','description', 'version', 
                 'is_public', 'created_by', 'created_at', 'steps_count', 'is_favorited']
        read_only_fields = ['id', 'created_at', 'created_by']
    
    def get_steps_count(self, obj):
        return obj.steps.count()
    
    def get_is_favorited(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.favorited_by.filter(user=request.user).exists()
        return False


class ProjectListSerializer(serializers.ModelSerializer):
    template = TemplateListSerializer(read_only=True)
    
    class Meta:
        model = Project
        fields = ['id', 'template', 'name', 'description', 'status', 
                 'progress_percentage', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'progress_percentage']

