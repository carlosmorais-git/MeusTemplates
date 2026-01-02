from django.contrib import admin
from .models import Template, TemplateStep, CodeSnippet


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
    fields = ['technology', 'name', 'version', 'is_public', 'created_by', 'file_path', 'created_at', 'updated_at']

    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(TemplateStep)
class TemplateStepAdmin(admin.ModelAdmin):
    list_display = ['template', 'order', 'question', 'step_type', 'is_required']
    list_filter = ['template__technology', 'step_type', 'is_required']
    search_fields = ['question', 'description']
    list_editable = ['order', 'is_required']


@admin.register(CodeSnippet)
class CodeSnippetAdmin(admin.ModelAdmin):
    list_display = ['template_step', 'language', 'is_example', 'created_at']
    list_filter = ['language', 'is_example', 'created_at']
    search_fields = ['description', 'code']
    readonly_fields = ['created_at']
