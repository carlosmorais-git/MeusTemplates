from rest_framework import serializers
from django.conf import settings
from .models import Technology, Template, TemplateStep, CodeSnippet, Favorite
from django.contrib.auth import get_user_model


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined']
        read_only_fields = ['id', 'date_joined']


class TechnologySerializer(serializers.ModelSerializer):
    templates_count = serializers.SerializerMethodField()

    class Meta:
        model = Technology
        fields = ['id', 'name', 'description', 'icon', 'color', 'documentation_url', 'created_at', 'templates_count']
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
        fields = ['id', 'question', 'description', 'step_type', 'is_required', 'order', 'parent_step', 'condition_value', 'choices', 'code_snippets']
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
        fields = ['id', 'technology', 'technology_id', 'name', 'description', 'version', 'is_public', 'created_by', 'created_at', 'updated_at', 'steps', 'steps_count', 'is_favorited']
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


class TemplateListSerializer(serializers.ModelSerializer):
    technology = TechnologySerializer(read_only=True)
    created_by = UserSerializer(read_only=True)
    steps_count = serializers.SerializerMethodField()
    is_favorited = serializers.SerializerMethodField()
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = Template
        fields = ['id', 'technology', 'name', 'created_by_username','description', 'version', 'is_public', 'created_by', 'created_at', 'steps_count', 'is_favorited']
        read_only_fields = ['id', 'created_at', 'created_by']

    def get_steps_count(self, obj):
        return obj.steps.count()

    def get_is_favorited(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.favorited_by.filter(user=request.user).exists()
        return False
