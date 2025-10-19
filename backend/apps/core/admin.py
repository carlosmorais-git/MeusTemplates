from django.contrib import admin
from .models import (
    Technology, Template, TemplateStep, Project, 
    ProjectResponse, CodeSnippet, UserProgress, Favorite
)


@admin.register(Technology)
class TechnologyAdmin(admin.ModelAdmin):
    list_display = ['name', 'icon', 'color', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at']


class TemplateStepInline(admin.TabularInline):
    model = TemplateStep
    extra = 1
    fields = ['order', 'question', 'step_type', 'is_required']


@admin.register(Template)
class TemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'technology', 'version', 'is_public', 'created_by', 'created_at']
    list_filter = ['technology', 'is_public', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [TemplateStepInline]
    
    def save_model(self, request, obj, form, change):
        if not change:  # Se é um novo objeto
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(TemplateStep)
class TemplateStepAdmin(admin.ModelAdmin):
    list_display = ['template', 'order', 'question', 'step_type', 'is_required']
    list_filter = ['template__technology', 'step_type', 'is_required']
    search_fields = ['question', 'description']
    list_editable = ['order', 'is_required']


class ProjectResponseInline(admin.TabularInline):
    model = ProjectResponse
    extra = 0
    readonly_fields = ['template_step', 'created_at']


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'template', 'status', 'progress_percentage', 'created_at']
    list_filter = ['status', 'template__technology', 'created_at']
    search_fields = ['name', 'description', 'user__username']
    readonly_fields = ['created_at', 'updated_at', 'progress_percentage']
    inlines = [ProjectResponseInline]


@admin.register(ProjectResponse)
class ProjectResponseAdmin(admin.ModelAdmin):
    list_display = ['project', 'template_step', 'is_completed', 'created_at']
    list_filter = ['is_completed', 'created_at']
    search_fields = ['project__name', 'template_step__question']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(CodeSnippet)
class CodeSnippetAdmin(admin.ModelAdmin):
    list_display = ['template_step', 'language', 'is_example', 'created_at']
    list_filter = ['language', 'is_example', 'created_at']
    search_fields = ['description', 'code']
    readonly_fields = ['created_at']


@admin.register(UserProgress)
class UserProgressAdmin(admin.ModelAdmin):
    list_display = ['user', 'technology', 'level', 'projects_completed', 'total_hours', 'last_activity']
    list_filter = ['technology', 'level', 'last_activity']
    search_fields = ['user__username', 'technology__name']
    readonly_fields = ['last_activity']


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ['user', 'template', 'created_at']
    list_filter = ['template__technology', 'created_at']
    search_fields = ['user__username', 'template__name']
    readonly_fields = ['created_at']

