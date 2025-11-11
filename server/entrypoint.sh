#!/bin/bash
set -e

echo "Running database migrations..."
python manage.py migrate --noinput

echo "Creating superuser if needed..."
python manage.py shell -c "
from django.contrib.auth import get_user_model;
User = get_user_model();
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@macrodash.com', 'admin123');
    print('Superuser created');
else:
    print('Superuser already exists');
" || echo "Superuser creation skipped"

echo "Starting Gunicorn..."
exec gunicorn --bind 0.0.0.0:8000 macrodash.wsgi:application
