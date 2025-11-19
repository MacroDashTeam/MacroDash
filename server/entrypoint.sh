#!/bin/bash
set -e

echo "==================================="
echo "MacroDash Server Startup"
echo "==================================="
echo "Working directory: $(pwd)"
echo "Python version: $(python --version)"
echo "Database file: $(python -c 'from macrodash.settings import DATABASES; print(DATABASES["default"]["NAME"])')"
echo "==================================="

echo "Checking database file..."
if [ -f "db.sqlite3" ]; then
    echo "✓ Database file exists"
    ls -lh db.sqlite3
else
    echo "⚠ Database file does not exist - will be created"
fi

echo ""
echo "Running database migrations..."
python manage.py migrate --noinput

echo ""
echo "Collecting static files..."
python manage.py collectstatic --noinput --clear || echo "Static files collection failed (non-critical)"

echo ""
echo "Creating superuser if needed..."
python manage.py shell -c "
from django.contrib.auth import get_user_model;
User = get_user_model();
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@macrodash.com', 'admin123');
    print('✓ Superuser created');
else:
    print('✓ Superuser already exists');
" || echo "⚠ Superuser creation skipped"

echo ""
echo "==================================="
echo "Database ready! Checking tables..."
python manage.py shell -c "
from django.db import connection;
with connection.cursor() as cursor:
    cursor.execute(\"SELECT table_name FROM information_schema.tables WHERE table_schema='public'\");
    tables = cursor.fetchall();
    print(f'✓ Found {len(tables)} tables in database');
    if tables:
        print('Tables:', ', '.join([t[0] for t in tables[:10]]));
"
echo "==================================="

echo ""
echo "Starting Gunicorn server..."
exec gunicorn --bind 0.0.0.0:8000 \
    --workers 2 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile - \
    --log-level info \
    macrodash.wsgi:application
