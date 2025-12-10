#!/bin/bash

# Activate virtual environment if it exists
if [ -d "macrodash_env" ]; then
    source macrodash_env/bin/activate
fi

# Run Django shell to create superadmin
python manage.py shell <<PYTHON
from django.contrib.auth.models import User

username = 'admin'
password = 'admin220'
email = 'admin@macrodash.com'

# Check if user already exists
if User.objects.filter(username=username).exists():
    print(f'User "{username}" already exists. Updating...')
    user = User.objects.get(username=username)
    user.set_password(password)
    user.is_staff = True
    user.is_superuser = True
    user.email = email
    user.save()
    print(f'Updated superadmin user "{username}"')
else:
    user = User.objects.create_superuser(
        username=username,
        email=email,
        password=password
    )
    print(f'Successfully created superadmin user "{username}"')

print(f'Username: {username}')
print(f'Password: {password}')
PYTHON
