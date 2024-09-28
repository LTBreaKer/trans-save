import sys
import json
import jwt
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.auth import login
from channels.db import database_sync_to_async
from django.db.models import Count, F, Subquery, OuterRef
from django.conf import settings
from django.contrib.auth.models import AnonymousUser
from .paddle_class import Paddle
from .ball_class import width, height, ballRaduis, paddleHeight, paddleWidth

########################## PlayerConsumer #########################
class PlayerConsumer(AsyncWebsocketConsumer):
	def __init__(self, *args, **kwargs):
		super().__init__(*args, **kwargs)
		self.ball_channel_name = ''
		self.paddle = Paddle()

	async def connect(self):
		await self.accept()
		await self.sendCunsumerPaddleCreated()

	async def connect_to_game(self, e):
		if (self.channel_name != e['player_channel_name']):
			await self.send(text_data=json.dumps({
				'message': 'create_ball_socket',
				'group_name': self.room_group_name
			}))


	async def add_group(self, e):
		self.room_name = e["group_name"]
		self.room_group_name = 'game_%s' % self.room_name
		await self.channel_layer.group_add(
			self.room_group_name,
			self.channel_name
		)

	async def assigning_paddle(self, e):
		if (e['paddle'] == "left_paddle"):
			self.paddle = Paddle(0, height/2)
		else:
			self.paddle = Paddle(width - 10, height/2)
		print(self.channel_name, file=sys.stderr)
		print("paddle: ", self.paddle.fn_str(), file=sys.stderr)

	async def sendCunsumerPaddleCreated(self):
		await self.send(text_data=json.dumps({
			'type_msg': 'consumer_paddle_created',
		}))
		

	async def disconnect(self, close_code):
		# await self.channel_layer.send(
		# 	self.ball_channel_name, 
		# 	{ 'type': 'deconnect_ball' })
		await self.channel_layer.group_discard(
			self.room_group_name,
			self.channel_name
		)

	async def receive(self, text_data):
		text_data_json = json.loads(text_data)
		type = text_data_json['type_msg']

		print("----- type: ", type, file=sys.stderr)
		if (type == "paddle"):
			self.paddle.update(text_data_json['ps'])
			await self.channel_layer.send(
			self.ball_channel_name, {
				'type': 'update_paddle_info',
				'name': self.channel_name, 
				'paddle': self.paddle.fn_data()
			})
		elif (type == "move"):
			if (self.ball_channel_name != ''):
				await self.channel_layer.send(
				self.ball_channel_name,
				{ 'type': 'move'})
		elif (type == "add_group"):
			await self.add_group(text_data_json)
		elif (type == "assigning_paddle"):
			await self.assigning_paddle(text_data_json)
			
 
	async def paddle_info_to_game(self, event):
		self.ball_channel_name = event['ball_channel_name']
		await self.channel_layer.send(
			self.ball_channel_name,
			{
				'type': 'paddle_info',
				'name': self.channel_name,
			}
		)

	async def get_paddle(self, event):
		self.paddle.update(event['paddle'])
		await self.send(text_data=json.dumps({
			'type_msg': 'init_paddle',
			'ps': event['paddle']
		}))

	async def chat_message(self, event):
		message = event['message']

		await self.send(text_data=json.dumps({
			'message': message
		}))

	async def draw_info(self, event):
		await self.send(text_data=json.dumps({
			'type_msg': 'draw_info',
			'ball': event['ball'],
			'left_paddle': event['left_paddle'],
			'right_paddle': event['right_paddle']
		}))

	# async def ball_is_connected(self, event):
	# 	pass

	async def already_one_player_connected(self, event):
		await self.channel_layer.send(
			event["player_channel_name"],
			{ 'is_connected': 'true' })