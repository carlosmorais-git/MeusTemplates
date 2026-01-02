from django.contrib import admin
from .models import UserProgress


@admin.register(UserProgress)
class UserProgressAdmin(admin.ModelAdmin):
    list_display = ['user', 'technology', 'level', 'projects_completed', 'total_hours', 'last_activity']
    list_filter = ['technology', 'level', 'last_activity']
    search_fields = ['user__username', 'technology__name']
    readonly_fields = ['last_activity']

