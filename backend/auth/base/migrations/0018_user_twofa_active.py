# Generated by Django 4.0.10 on 2024-08-02 18:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0017_alter_user_is_logged_out'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='twofa_active',
            field=models.BooleanField(default=False),
        ),
    ]