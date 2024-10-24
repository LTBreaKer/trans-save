# Generated by Django 5.0.9 on 2024-10-24 17:37

import base.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='TagGameDb',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('player1_id', models.IntegerField()),
                ('player2_id', models.IntegerField()),
                ('is_remote', models.BooleanField(default=True)),
                ('player1_avatar', models.CharField(default='/media/avatars/avatar-default.webp')),
                ('player2_avatar', models.CharField(default='/media/avatars/avatar-default.webp')),
                ('player1_name', models.CharField(max_length=150, validators=[base.validators.CustomUsernameValidator()])),
                ('player2_name', models.CharField(max_length=150, validators=[base.validators.CustomUsernameValidator()])),
                ('winner_id', models.IntegerField(blank=True, null=True)),
                ('winner_name', models.CharField(blank=True, max_length=150, null=True)),
                ('is_active', models.BooleanField(default=True)),
                ('is_connected', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
    ]
