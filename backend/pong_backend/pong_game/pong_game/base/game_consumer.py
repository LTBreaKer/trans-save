import asyncio
import sys
import json
import jwt
import os
import random
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.auth import login
from channels.db import database_sync_to_async
from django.db.models import Count, F, Subquery, OuterRef
from django.conf import settings
from django.contrib.auth.models import AnonymousUser
from core.serializers import UserSerializer
from core.models import User
from player.models import Player, Gamer
from .ball_class import Ball
from .paddle_class import Paddle
from .ball_class import width, height, ballRaduis, paddleHeight, paddleWidth
from player.models import Turn, TrainingData
from tensorflow.keras.models import load_model
import numpy as np

# @database_sync_to_async
# def output_pos_hit(pos_hit):
# 	try:
# 		TrainingData.objects.filter(pos_hit=-1).update(pos_hit=pos_hit)
# 	except:
# 		print("")

class GameConsumer(AsyncWebsocketConsumer):
	def __init__(self, *args, **kwargs):
		super().__init__(*args, **kwargs)
		self.ball = Ball()
		self.lpaddle = Paddle(0, height/2)
		self.rpaddle = Paddle(width - 10, height/2)
		self.paddles = {}
		self.gameOver = False

	async def connect(self):
		self.room_group_name = self.scope['url_route']['kwargs']['room_name']
		await self.channel_layer.group_add(
			self.room_group_name,
			self.channel_name
		)
		await self.accept()
		await self.chat_message({'message': 'game'})
		await self.channel_layer.group_send(
			self.room_group_name,
			{
				'type': 'paddle_info_to_game',
				'ball_channel_name': self.channel_name
			}
		)  
	
	async def disconnect(self, close_code):
		await self.channel_layer.group_discard(
			self.room_group_name,
			self.channel_name
		)

	async def deconnect_ball(self, event):
		await self.close(code=1000)

	async def receive(self, text_data):
		text_data_json = json.loads(text_data)
		type = text_data_json['type_msg']
		if (type == "move"):
			asyncio.create_task(self.update_ball(type))

	async def move(self, event):
		self.gameOver = False
		asyncio.create_task(self.update_ball(type))

	async def update_ball(self, event):
		print("game_over: ", self.ball.gameOver, file=sys.stderr)
		turn = await Turn.objects.acreate()
		time = 0.0
		# model_path = os.path.join(settings.BASE_DIR, 'game/model3400_200.h5')
		model_path = os.path.join(settings.BASE_DIR, 'game/agent_model/model4700_300.h5')
		model = load_model(model_path)
		numbers = [20, 20, 20, 50, 50, 50]
		# numbers = [60, 60, 60]
		# numbers = [30, 30, 30]
		# numbers = [10, 10, 10, 20, 30, 40, 50, 60, 60]
		# training_data = 
		while (not self.gameOver):
				# print("self.paddles[ai]: ", self.paddles["ai"], file=sys.stderr)

			tmp = self.ball.velX
			pos_hit = self.ball.y
			if (time.is_integer() and self.ball.ballOut == 10):
				self.ball.vel += 0.2
				data = await TrainingData.objects.acreate(
					turn=turn,
					y_left_paddle=self.lpaddle.y,
					y_right_paddle=self.rpaddle.y,
					x_ball=self.ball.x,
					y_ball=self.ball.y,
					vel_x_ball=self.ball.velX,
					vel_y_ball=self.ball.velY,
					time = time,
					pos_hit = -1,
					collision = False)
				if ("ai" in self.paddles):
					input_values = [self.ball.x / 10, self.ball.y / 10, self.ball.velX, self.ball.velY]
					input_array = np.array(input_values).reshape(1, -1)
					predictions = model.predict(input_array)
			if ("ai" in self.paddles):
				random_number = random.choice(numbers)
				self.rpaddle.ai_update(predictions * 10 - random_number)
			self.ball.update(self.rpaddle, self.lpaddle)
			if ((self.ball.velX * tmp < 0)):
				tmp = self.ball.velX
				await output_pos_hit(pos_hit)
			if ((self.ball.endTurn and self.ball.ballOut <= 11)):
				await output_pos_hit(pos_hit)
			# if (self.ball.gameOver):
			# 	tmp = self.ball.velX 	
			# 	await output_pos_hit(-2)

			await asyncio.sleep(0.015625)
			time += 0.015625
			await self.channel_layer.group_send(
				self.room_group_name,
				{
					'type': 'draw_info',
					'ball': self.ball.fn_str(),
					'left_paddle': self.lpaddle.fn_str(),	
					'right_paddle': self.rpaddle.fn_str()
				}
			)
			if (self.ball.gameOver):
				self.gameOver = True
				self.ball.gameOver = False

	async def draw_info(self, event):
		pass

	async def chat_message(self, event):
		message = event['message']
		await self.send(text_data=json.dumps({
			'message': message
		}))

	async def paddle_info_to_game(self, event):
		pass

	async def paddle_info(self, event):
		if (self.paddles == {}):
			self.paddles[event['name']] = self.lpaddle
		else:
			self.paddles[event['name']] = self.rpaddle
		if (event['name'] != 'ai'):
			await self.channel_layer.send(
				event['name'], 
				{
					'type': 'get_paddle',
					'paddle': self.paddles[event['name']].fn_data()
				}
			)

	async def update_paddle_info(self, event):
		self.paddles[event['name']].update(event['paddle'])
