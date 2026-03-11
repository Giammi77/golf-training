from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, GolferProfile


class GolferProfileInline(admin.StackedInline):
    model = GolferProfile
    can_delete = False


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    inlines = [GolferProfileInline]


@admin.register(GolferProfile)
class GolferProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'nr_tessera', 'hcp']
    search_fields = ['user__first_name', 'user__last_name', 'nr_tessera']
