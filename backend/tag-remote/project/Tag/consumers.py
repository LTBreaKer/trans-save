import json
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
# from asgiref.sync import async_to_sync

from . import init
from .init import gameMonitor, Player

class MyConsumer(AsyncWebsocketConsumer):

    players_c = []

    async def connect(self):
        self.is_open = True

        self.monitor = gameMonitor(self)
        self.room_group_name = "game_room"
        self.id = len(self.players_c)
        self.enemy_id = 0 if self.id == 1 else 1

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        if len(self.players_c) < 2:
            self.players_c.append(self)

        if len(self.players_c) == 2:
            await self.send_all('start game')
            self.players_c[0].monitor.players = [Player(0, "player"), Player(1, "enemy")]
            self.players_c[1].monitor.players = [Player(0, "enemy"), Player(1, "player")]
            asyncio.create_task(self.players_c[0].monitor.gameLoop())
            asyncio.create_task(self.players_c[1].monitor.gameLoop())


        await self.send(text_data=json.dumps({
            "action":"connected"
        }))



    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        action = text_data_json.get('action')

        if self.is_open and action == "window resize":
            await init.resizeWindow(text_data_json, self, self.monitor)

            if self.monitor.players[self.id].name == None and self.monitor.players[self.enemy_id].name == None:
                if self.id % 2 == 0:
                    self.monitor.players[self.id].name = text_data_json.get("player0_name")
                    self.monitor.players[self.enemy_id].name = text_data_json.get("player1_name")
                else:
                    self.monitor.players[self.id].name = text_data_json.get("player1_name")
                    self.monitor.players[self.enemy_id].name = text_data_json.get("player0_name")

        if self.is_open and action == "key update":
            self.players_c[self.id].monitor.players[self.id].key['right'] = text_data_json.get('P0_rightPressed')
            self.players_c[self.enemy_id].monitor.players[self.id].key['right'] = text_data_json.get('P0_rightPressed')

            self.players_c[self.id].monitor.players[self.id].key['left'] = text_data_json.get('P0_leftPressed')
            self.players_c[self.enemy_id].monitor.players[self.id].key['left'] = text_data_json.get('P0_leftPressed')

            self.players_c[self.id].monitor.players[self.id].key['upReleas'] = text_data_json.get('P0_upreleased')
            self.players_c[self.enemy_id].monitor.players[self.id].key['upReleas'] = text_data_json.get('P0_upreleased')

            if self.players_c[self.id].monitor.players[self.id].key['upReleas'] == False and self.players_c[self.id].monitor.players[self.id].key['upPressed'] == False:
                self.players_c[self.id].monitor.players[self.id].velocity['y'] = self.players_c[self.id].monitor.players[self.id].vitesse['up']
                self.players_c[self.id].monitor.players[self.id].key['upPressed'] = True

            if self.players_c[self.enemy_id].monitor.players[self.id].key['upReleas'] == False and self.players_c[self.enemy_id].monitor.players[self.id].key['upPressed'] == False:
                self.players_c[self.enemy_id].monitor.players[self.id].velocity['y'] = self.players_c[self.enemy_id].monitor.players[self.id].vitesse['up']
                self.players_c[self.enemy_id].monitor.players[self.id].key['upPressed'] = True

    async def send_all(self, message):
        await self.channel_layer.group_send(
            self.room_group_name,
            {'type': 'to_all','message': message}
        )

    async def to_all(self, event):
        await self.send(text_data=json.dumps({
            'content': event['message']
        }))

    async def send_gameUpdate(self):
        await self.send(text_data=json.dumps({
            'action': 'game update',
            'canvas_width': self.monitor.canvas_width,
            'canvas_height': self.monitor.canvas_height,

            'platform_widths': self.monitor.platform_widths,
            'platform_heights': self.monitor.platform_heights,
            'platform_xs': self.monitor.platform_xs,
            'platform_ys': self.monitor.platform_ys,
        }))

    async def send_playerUpdate(self):
        await self.send(text_data=json.dumps({
            'action': 'update player',
            'player0_x': self.monitor.players[0].position['x'],
            'player0_y': self.monitor.players[0].position['y'],
            'upPressed0': self.monitor.players[0].key['upPressed'],

            'player1_x': self.monitor.players[1].position['x'],
            'player1_y': self.monitor.players[1].position['y'],
            'upPressed1': self.monitor.players[1].key['upPressed'],

            'player_width': self.monitor.players[0].width,
            'player_height': self.monitor.players[0].height,

            'player0_Tagger': self.monitor.players[0].tagger,
            'player1_Tagger': self.monitor.players[1].tagger,
            'GO': self.monitor.GO,
            'time': self.monitor.game_time,
            'winner': self.monitor.winner,
        }))

        await self.send(text_data=json.dumps({
            'action': 'update key',
            'leftPressed0': self.players_c[self.id].monitor.players[0].key['left'],
            'rightPressed0': self.players_c[self.id].monitor.players[0].key['right'],
            
            'leftPressed1': self.players_c[self.id].monitor.players[1].key['left'],
            'rightPressed1': self.players_c[self.id].monitor.players[1].key['right'],         
        }))

    async def disconnect(self, code):
        self.is_open = False

        # If the array is not empty, clear it and disconnect other consumers
        if len(self.players_c) > 0:
            # Disconnect all other consumers
            for player in self.players_c:
                if player != self and player.is_open:
                    await player.close()

            # Clear the entire array
            self.players_c.clear()

        # Remove the current consumer from the group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
