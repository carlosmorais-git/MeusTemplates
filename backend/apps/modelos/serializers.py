from rest_framework import serializers
from django.conf import settings
from .models import Template, TemplateStep, CodeSnippet
from django.contrib.auth import get_user_model


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined']
        read_only_fields = ['id', 'date_joined']


# Note: `Technology` model was removed — templates now store `technology` as a string.


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
    technology = serializers.CharField()
    created_by = UserSerializer(read_only=True)
    steps = TemplateStepSerializer(many=True, read_only=True)
    steps_count = serializers.SerializerMethodField()
    file_path = serializers.CharField(read_only=True)

    class Meta:
        model = Template
        fields = ['id', 'technology', 'name', 'description', 'version', 'is_public', 'created_by', 'created_at', 'updated_at', 'steps', 'steps_count', 'file_path']
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by']

    def get_steps_count(self, obj):
        return obj.steps.count()

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['created_by'] = request.user
        return super().create(validated_data)



class TemplateListSerializer(serializers.ModelSerializer):
    technology = serializers.CharField()
    created_by = UserSerializer(read_only=True)
    steps_count = serializers.SerializerMethodField()
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = Template
        fields = ['id', 
        'technology', 
        'name', 
        'created_by_username',
        'description', 
        'version', 
        'is_public', 
        'created_by',
          'created_at', 
          'steps_count']
        read_only_fields = ['id', 'created_at', 'created_by']

    def get_steps_count(self, obj):
        return obj.steps.count()
