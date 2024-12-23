from channels.generic.websocket import AsyncWebsocketConsumer
import json
from .helpers import check_auth, get_user
from asgiref.sync import sync_to_async
from channels.db import database_sync_to_async
import asyncio

class RemoteGame(AsyncWebsocketConsumer):
    async def connect(self):
        self.user_id = -1

        SUBPROTOCOLS = self.scope.get('subprotocols')
        token = SUBPROTOCOLS[1] if SUBPROTOCOLS and len(SUBPROTOCOLS) > 1 else None
        session_id = SUBPROTOCOLS[3] if SUBPROTOCOLS and len(SUBPROTOCOLS) > 3 else None
        if not token or not session_id:
            await self.close(code=4000)
            return
        auth_header = f"Bearer {token}"

        response = await sync_to_async(check_auth)(auth_header, session_id)
        if response.status_code != 200:
            await self.close(code=4001)
            return
        
        user_data = await sync_to_async(response.json)()
        self.user_id = user_data['user_data']['id']

        await self.channel_layer.group_add(
            f"player_{self.user_id}", self.channel_name
        )
        await self.accept(subprotocol='token')

    async def receive(self, text_data):

        from base.models import TagGameDb

        text_data_json = json.loads(text_data)
        message = text_data_json['message']

        if message == 'player connected':
            game_id = text_data_json['game_id']
            player_id = text_data_json['player_id']
            if not player_id or not game_id:
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'error': 'game_id and player_id required'
                }))
                return
            game_id = int(game_id)
            player_id = int(player_id)
            try:
                game = await database_sync_to_async(TagGameDb.objects.get)(id=game_id)
            except TagGameDb.DoesNotExist:
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'error': 'Game not found'
                }))
                return

            if player_id == game.player1_id:
                await asyncio.sleep(0.2)
                if game.player1_connected:
                    await self.send(text_data=json.dumps({
                        'type': 'error',
                        'error': 'Player already connected'
                    }))
                    return
                
                await database_sync_to_async(TagGameDb.objects.filter(id=game_id).update)(player1_connected=True)

                game = await database_sync_to_async(TagGameDb.objects.get)(id=game_id)

            elif player_id == game.player2_id:
                if game.player2_connected:
                    await self.send(text_data=json.dumps({
                        'type': 'error',
                        'error': 'Player already connected'
                    }))
                    return
                await database_sync_to_async(TagGameDb.objects.filter(id=game_id).update)(player2_connected=True)

                game = await database_sync_to_async(TagGameDb.objects.get)(id=game_id)

            else:
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'error': 'No player found with the provided player_id'
                }))
                return
            
            if game.player1_connected and game.player2_connected:
                await self.send(text_data=json.dumps({
                    'type': 'message',
                    'message': 'Both players are connected'
                }))
            else:
                await self.send(text_data=json.dumps({
                    'type': 'message',
                    'message': 'Waiting for second player to connect'
                }))


    
    async def disconnect(self, code):
        if self.user_id == -1:
            return
        
        await self.channel_layer.group_discard(
            f"player_{self.user_id}", self.channel_name
        )

    async def remote_game_created(self, event):
        await self.send(text_data=json.dumps({
            "data" : event
        }))