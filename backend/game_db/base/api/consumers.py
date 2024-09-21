from channels.generic.websocket import AsyncWebsocketConsumer
import json
from .helpers import check_auth, get_user
from asgiref.sync import sync_to_async

class RemoteGame(AsyncWebsocketConsumer):
    async def connect(self):
        self.user_id = -1

        SUBPROTOCOLS = self.scope.get('subprotocols')
        token = SUBPROTOCOLS[1] if SUBPROTOCOLS and len(SUBPROTOCOLS) > 1 else None
        if not token:
            await self.close(code=4000)
            return
        auth_header = f"Bearer {token}"

        response = await sync_to_async(check_auth)(auth_header)
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

        from base.models import GameDb

        text_data_json = json.loads(text_data)
        message = text_data_json['message']

        if message == 'player connected':
            game_id = text_data_json['game_id']
            try:
                game = await sync_to_async(GameDb.objects.get)(id=game_id)
            except GameDb.DoesNotExist:
                await self.send(text_data=json.dumps({
                    'error': 'Game not found'
                }))
                return
            if game.number_of_connected_players == 0:
                game.number_of_connected_players = 1
                await sync_to_async(game.save)()
                await self.send(text_data=json.dumps({
                    'message': 'Waiting for second player'
                }))
            elif game.number_of_connected_players == 1:
                game.number_of_connected_players = 2
                await sync_to_async(game.save)()

                self.send(text_data=json.dumps({
                    "message": "both players are connected"
                }))
            else:
                await self.send(text_data=json.dumps({
                    'error': 'Game is full'
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