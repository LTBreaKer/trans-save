from rest_framework import serializers
from .models import GameDb

class GameDbSerialiser(serializers.ModelSerializer):
    class Meta:
        model   = GameDb
        fields  = [
            'player1_id',
            'player2_id',
            'player1_avatar',
            'player2_avatar',
            'player1_score',
            'player2_score',
            'is_active',
            'is_remote',
            'player1_name',
            'player2_name',
            'player1_name',
            'created_at',
        ]
    
    def create(self, validated_data, *args, **kwargs):
        game = GameDb.objects.create(**validated_data)
        return game