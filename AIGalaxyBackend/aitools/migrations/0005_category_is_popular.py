# Generated migration for adding is_popular field to Category model

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('aitools', '0004_aitool_is_free_aitool_is_popular'),
    ]

    operations = [
        migrations.AddField(
            model_name='category',
            name='is_popular',
            field=models.BooleanField(default=False),
        ),
    ]










