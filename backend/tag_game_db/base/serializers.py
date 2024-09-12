from rest_framework import serializers
from .models import TagGameDb

class TagGameDbSerialiser(serializers.ModelSerializer):
    class Meta:
        model   = TagGameDb
        fields  = [
            'id',
            'player1_id',
            'player2_id',
            'is_active',
            'is_remote',
            'player1_name',
            'player2_name',
            'winner_name',
            'winner_id',
            'created_at',
        ]
    
    def create(self, validated_data, *args, **kwargs):
        game = TagGameDb.objects.create(**validated_data)
        return game