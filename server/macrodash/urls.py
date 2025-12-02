"""macrodash URL Configuration"""
from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView
from django.conf import settings

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('api/auth/', include('dj_rest_auth.urls')),
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),
    path('accounts/', include('allauth.account.urls')),
    path('accounts/', include('allauth.socialaccount.urls')),
    path('accounts/', include('allauth.socialaccount.providers.google.urls')),
    path('password-reset/confirm/<uidb64>/<token>/', 
         RedirectView.as_view(url=f'{settings.FRONTEND_URL}/password-reset/confirm/%(uidb64)s/%(token)s/', permanent=False),
         name='password_reset_confirm'),
]