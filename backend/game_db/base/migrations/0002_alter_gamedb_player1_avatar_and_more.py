# Generated by Django 5.0.9 on 2024-09-25 21:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='gamedb',
            name='player1_avatar',
            field=models.CharField(default='/media/avatars/avatar-default.webp'),
        ),
        migrations.AlterField(
            model_name='gamedb',
            name='player2_avatar',
            field=models.CharField(default='/media/avatars/avatar-default.webp'),
        ),
    ]
