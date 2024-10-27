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
		self.room_group_name = 0
		self.paddle = Paddle()

	async def connect(self):
		await self.accept()

	async def add_group(self, e):
		self.room_name = e["group_name"]
		self.room_group_name = 'game_%s' % self.room_name
		await self.channel_layer.group_add(
			self.room_group_name,
			self.channel_name
		)
		await self.sendCunsumerPaddleCreated()

	async def assigning_paddle(self, e):
		if (e['paddle'] == "left_paddle"):
			self.paddle = Paddle(0, height/2)
		else:
			self.paddle = Paddle(width - 10, height/2)
		print(self.channel_name, file=sys.stderr)
		# print("paddle: ", self.paddle.fn_str(), file=sys.stderr)

	async def sendCunsumerPaddleCreated(self):
		await self.send(text_data=json.dumps({
			'type_msg': 'consumer_paddle_created',
		}))
		
	async def disconnect(self, close_code):
		# await self.channel_layer.send(
		# 	self.ball_channel_name, 
		# 	{ 'type': 'deconnect_ball' })
		if (not self.room_group_name):
			return
		await self.close_game_consumers()
		await self.channel_layer.group_discard(
			self.room_group_name,
			self.channel_name
		)

	async def receive(self, text_data):
		text_data_json = json.loads(text_data)
		type = text_data_json['type_msg']

		# print("-------- Paddle ----- data_json: ", text_data_json, file=sys.stderr)
		if (type == "update_paddle"):
			if (self.ball_channel_name != ''):
				await self.update_paddle(text_data_json['paddle']['ps'])
		elif (type == "move"):
			print("self.ball_channel_name: ", self.ball_channel_name)
			await self.launsh_game()
			# if (self.ball_channel_name != ''):
			# 	await self.channel_layer.send(
			# 	self.ball_channel_name,
			# 	{ 'type': 'move'})
		elif (type == "add_group"):
			await self.add_group(text_data_json)
		elif (type == "assigning_paddle"):
			await self.assigning_paddle(text_data_json)
		elif (type == "close"):
			await self.close_game_consumers()
	
	async def launsh_game(self):
		print("----------launsh_game----------------", file=sys.stderr)
		await self.channel_layer.group_send(
			self.room_group_name, {
				'type': 'launsh',
				'channel_name': self.channel_name 
			})

	async def launsh(self, e):
		print("----------launsh----------------", file=sys.stderr)
		print("self.channel_name: ", self.channel_name, file=sys.stderr)
		print("e['channel_name']: ", e['channel_name'], file=sys.stderr)
		if (self.channel_name != e['channel_name'] and self.ball_channel_name != ''):
			await self.channel_layer.send(
				self.ball_channel_name,
				{'type': 'move'})

	async def close_game_consumers(self):
		if (not self.room_group_name):
			return
		left_paddle_score = 0 if (self.paddle.x == 0) else 3
		right_paddle_score = 0 if (left_paddle_score == 3) else 3
		await self.channel_layer.group_send(
			self.room_group_name, {
				'type': 'desconnect_consumer',
				'left_paddle_score': left_paddle_score,
				'right_paddle_score': right_paddle_score
			})

	async def update_paddle(self, e):
		update_paddle = "update_right_paddle"
		if (self.paddle.x == 0):
			update_paddle = "update_left_paddle"
		self.paddle.update(e)
		await self.channel_layer.send(
		self.ball_channel_name, {
			'type': update_paddle,
			'paddle': self.paddle.fn_data()
		})

	async def draw_info(self, event):
		try:
			await self.send(text_data=json.dumps({
				'type_msg': 'draw_info',
				'ball': event['ball'],
				'left_paddle': event['left_paddle'],
				'right_paddle': event['right_paddle']
			}))
		except Disconnected:
			print("Attempted to send on a closed WebSocket connection.", file=sys.stderr)

	async def set_ball_channel_name(self, event):
		self.ball_channel_name = event['ball_channel_name']
		print("ball_channel_name: ", self.ball_channel_name, file=sys.stderr)
	
	async def desconnect_consumer(self, e):
		await self.send(text_data=json.dumps({
			'type_msg': 'game_over',
			'left_paddle_score': e['left_paddle_score'],
			'right_paddle_score': e['right_paddle_score']
		}))
		await self.close(code=1000)