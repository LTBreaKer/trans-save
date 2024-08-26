from rest_framework import serializers
from .models import TagGameDb

class TagGameDbSerialiser(serializers.ModelSerializer):
    class Meta:
        model   = TagGameDb
        fields  = [
            'player1_id',
            'player2_id',
            'player1_score',
            'player2_score',
            'is_active',
            'is_remote',
            'player2_name',
            'created_at',
        ]
    
    def create(self, validated_data, *args, **kwargs):
        game = TagGameDb.objects.create(**validated_data)
        return game