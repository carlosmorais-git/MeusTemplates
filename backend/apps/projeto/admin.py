from django.contrib import admin
from .models import Project, ProjectResponse


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
