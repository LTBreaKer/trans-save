from django.contrib import admin
from .models import CustomUser, CustomUserProfile
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
# Register your models here.
# admin.site.register(CustomUser)
class UserAdmin(BaseUserAdmin):
    # Specify the fieldsets to be displayed in the Django admin panel
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('date_joined',)}),
    )
    # Specify the add_fieldsets to be displayed when adding a user in the Django admin panel
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'password1', 'password2'),
        }),
    )
    # Specify the list_display to be displayed in the user list in the Django admin panel
    list_display = ('username', 'first_name', 'last_name', 'is_active', 'is_staff', 'is_superuser')
    # Specify the list_filter to be used for filtering users in the Django admin panel
    list_filter = ('is_active', 'is_staff', 'is_superuser', 'groups')
    # Specify the search_fields to be used for searching users in the Django admin panel
    search_fields = ('username', 'first_name', 'last_name')
    # Specify the ordering to be used for ordering users in the Django admin panel
    ordering = ('username',)

# Register the custom UserAdmin class with the AppUser model
admin.site.register(CustomUser, UserAdmin)
admin.site.register(CustomUserProfile)