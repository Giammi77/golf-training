from django.contrib import admin, messages
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, GolferProfile


class GolferProfileInline(admin.StackedInline):
    model = GolferProfile
    can_delete = False


@admin.action(description='Reset password al default (cognomenome)')
def reset_password_to_default(modeladmin, request, queryset):
    for user in queryset:
        default_password = (user.last_name + user.first_name).lower().replace(' ', '')
        user.set_password(default_password)
        user.save()
    messages.success(request, f'Password resettata per {queryset.count()} utente/i.')


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    inlines = [GolferProfileInline]
    actions = [reset_password_to_default]


@admin.register(GolferProfile)
class GolferProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'nr_tessera', 'hcp']
    search_fields = ['user__first_name', 'user__last_name', 'nr_tessera']
