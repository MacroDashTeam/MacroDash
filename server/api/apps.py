from django.apps import AppConfig
from django.db import connection


class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self):
        """Initialize the price alert scheduler when Django starts"""
        # Enable WAL mode for SQLite to reduce locking issues
        if connection.vendor == 'sqlite':
            with connection.cursor() as cursor:
                cursor.execute('PRAGMA journal_mode=WAL;')
                cursor.execute('PRAGMA busy_timeout=20000;')  # 20 seconds timeout

        from api import scheduler
        scheduler.start_scheduler()