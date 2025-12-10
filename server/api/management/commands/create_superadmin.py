from django.core.management.base import BaseCommand
from django.contrib.auth.models import User


class Command(BaseCommand):
    help = 'Creates a superadmin user with username "admin" and password "admin220"'

    def handle(self, *args, **options):
        username = 'admin'
        password = 'admin220'
        email = 'admin@macrodash.com'

        # Check if user already exists
        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.WARNING(f'User "{username}" already exists. Updating password...'))
            user = User.objects.get(username=username)
            user.set_password(password)
            user.is_staff = True
            user.is_superuser = True
            user.email = email
            user.save()
            self.stdout.write(self.style.SUCCESS(f'Updated superadmin user "{username}"'))
        else:
            # Create new superadmin user
            user = User.objects.create_superuser(
                username=username,
                email=email,
                password=password
            )
            self.stdout.write(self.style.SUCCESS(f'Successfully created superadmin user "{username}"'))

        self.stdout.write(self.style.SUCCESS(f'Username: {username}'))
        self.stdout.write(self.style.SUCCESS(f'Password: {password}'))
