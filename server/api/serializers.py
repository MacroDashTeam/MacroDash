from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from .models import UserPreferences

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    is_admin = serializers.SerializerMethodField()
    is_superuser = serializers.BooleanField(read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'is_admin', 'is_superuser')
        read_only_fields = ('id', 'email', 'is_superuser')

    def get_is_admin(self, obj):
        """Get is_admin from UserPreferences"""
        try:
            preferences = UserPreferences.objects.get(user=obj)
            return preferences.is_admin
        except UserPreferences.DoesNotExist:
            return False
