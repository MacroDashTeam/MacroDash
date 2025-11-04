from django.core.management.base import BaseCommand
from api.scheduler import fetch_stock_insights

class Command(BaseCommand):
    help = 'Generate AI-powered stock insights for popular stocks'

    def handle(self, *args, **options):
        self.stdout.write('Starting AI insights generation...')
        fetch_stock_insights()
        self.stdout.write(self.style.SUCCESS('Successfully generated stock insights!'))
