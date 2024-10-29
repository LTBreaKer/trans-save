import asyncio
import sys
import json
import os
import random
from channels.generic.websocket import AsyncWebsocketConsumer
from django.conf import settings
from django.contrib.auth.models import AnonymousUser
from .ball_class import Ball
from .paddle_class import Paddle
from .ball_class import width, height

goals_to_win = 2

class GameConsumer(AsyncWebsocketConsumer):
	def __init__(self, *args, **kwargs):
		super().__init__(*args, **kwargs)
		self.ball = Ball()
		self.lpaddle = Paddle(0, height/2)
		self.rpaddle = Paddle(width - 10, height/2)
		self.gameOver = False

	async def connect(self):
		await self.accept()
		
	async def add_group(self, e):
		self.room_name = e["group_name"]
		self.room_group_name = 'game_%s' % self.room_name
		await self.channel_layer.group_add(
			self.room_group_name,
			self.channel_name
		)
		print("game consumer : ", e["group_name"], file=sys.stderr)
		await self.send_ball_channel_name()

	async def send_ball_channel_name(self):
		await self.channel_layer.group_send(
			self.room_group_name,
			{
				'type': 'set_ball_channel_name',
				'ball_channel_name': self.channel_name
			}
		)
		await self.send(text_data=json.dumps({
			'type_msg': 'play',
		}))

	async def launsh(self, e):
		pass
		
	async def disconnect(self, close_code):
		await self.channel_layer.group_discard(
			self.room_group_name,
			self.channel_name
		)

	# async def ball_is_connected(self, event):
	# 	await self.channel_layer.send(
	# 		event["player_channel_name"],
	# 		{ 'is_connected': 'true' })

	async def deconnect_ball(self, event):
		await self.close(code=1000)

	async def receive(self, text_data):
		text_data_json = json.loads(text_data)
		type = text_data_json['type_msg']
		print("--------Game ----- data_json: ", text_data_json, file=sys.stderr)
		if (type == "add_group"):
			await self.add_group(text_data_json)
		# if (type == "move"):
		# 	self.ball.gameOver = False
		# 	asyncio.create_task(self.update_ball(type))

	async def move(self, event):
		self.gameOver = False
		self.ball.gameOver = False
		asyncio.create_task(self.update_ball(type))

	async def update_ball(self, event):
		time = 0.0
		while (not self.ball.gameOver):
			try:
				if (time.is_integer()):
					self.ball.vel += 0.2
				self.ball.update(self.rpaddle, self.lpaddle)
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
			except Exception as e:
				print("Exception: ", e, file=sys.stderr)
		try:
			if (self.ball.gameOver and (self.lpaddle.nb_goal == goals_to_win or self.rpaddle.nb_goal == goals_to_win)):
				await self.end_game()
			else:
				await self.send(text_data=json.dumps({
					'type_msg': 'play',
				}))
		except Exception as e:
			print("Exception: ", e, file=sys.stderr)

	async def draw_info(self, event):
		pass
	async def set_ball_channel_name(self, event):
		pass
	
	async def update_left_paddle(self, event):
		self.lpaddle.update(event['paddle'])

	async def update_right_paddle(self, event):
		self.rpaddle.update(event['paddle'])

	async def send_scores(self):
		try:
			await self.send(text_data=json.dumps({
				'type': 'game_over',
				'left_paddle_score': self.lpaddle.nb_goal,
				'right_paddle_score': self.rpaddle.nb_goal,
			}))
		except Exception as e:
			print("Exception: ", e, file=sys.stderr)

	async def end_game(self):
		await self.send_scores()
		try:
			await self.channel_layer.group_send(
				self.room_group_name,
				{
					'type': 'desconnect_consumer',
					'left_paddle_score': self.lpaddle.nb_goal,
					'right_paddle_score': self.rpaddle.nb_goal,
				})
		except Exception as e:
			print("Exception: ", e, file=sys.stderr)
		
	async def desconnect_consumer(self, e):
		await self.close(code=1000)