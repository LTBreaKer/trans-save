# Generated by Django 5.0.8 on 2024-08-18 13:30

import base.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0002_gamedb_created_at_gamedb_is_remote_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='gamedb',
            name='player2_name',
            field=models.CharField(max_length=150, validators=[base.validators.CustomUsernameValidator()]),
        ),
    ]