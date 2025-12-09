# Generated manually for model changes
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('api', '0007_userpreferences_is_admin'),
    ]

    operations = [
        migrations.AddField(
            model_name='savedchartdisplay',
            name='user',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='savedchartdisplay',
            name='user_session',
            field=models.CharField(blank=True, db_index=True, help_text='Session ID for anonymous users (deprecated - use user field)', max_length=255, null=True),
        ),
        migrations.AlterModelOptions(
            name='savedchartdisplay',
            options={'ordering': ['-updated_at']},
        ),
        migrations.AddIndex(
            model_name='savedchartdisplay',
            index=models.Index(fields=['user', 'created_at'], name='api_savedch_user_id_8fef91_idx'),
        ),
    ]
