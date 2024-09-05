import sys
import json
import jwt
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.auth import login
from channels.db import database_sync_to_async
from django.db.models import Count, F, Subquery, OuterRef
from django.conf import settings
from django.contrib.auth.models import AnonymousUser
# from core.serializers import UserSerializer
# from player.serializers import ConsumerPlayerSerializer
# from core.models import User
# from .models import CustomRoomsConfig
# from player.models import Player, Gamer
from .paddle_class import Paddle
from .ball_class import width, height, ballRaduis, paddleHeight, paddleWidth

# @database_sync_to_async
# def get_user(user_id):
# 	try:
# 		return (User.objects.get(id=user_id))
# 	except User.DoesNotExist:
# 		return (AnonymousUser())
	
# @database_sync_to_async
# def get_player(user):
# 	try:
# 		return (Player.objects.get(user=user))
# 	except Player.DoesNotExist:
# 		return (AnonymousUser())

# @database_sync_to_async
# def get_gamers():
# 	try:
# 		player_with_unique_group = Player.objects.exclude(channel_name='_').values('room_group_name')\
# 		.annotate(group_count=Count('room_group_name'))\
# 		.filter(group_count=1).values('room_group_name')
# 		return list(Player.objects.exclude(channel_name='_').filter(room_group_name__in=Subquery(player_with_unique_group)))
# 	except Player.DoesNotExist:
# 		return (AnonymouseUser)

	

# def get_user_id(token):
# 	secret_key = settings.SECRET_KEY
# 	decoded_token = jwt.decode(token, secret_key, algorithms=['HS256'])
# 	return decoded_token['user_id']

# @database_sync_to_async
# def get_or_create_custom_rooms_config(room_group_name):
#     return CustomRoomsConfig.objects.get_or_create(name=room_group_name)

# @database_sync_to_async
# def get_custom_rooms_config(room_group_name):
#     return CustomRoomsConfig.objects.get(name=room_group_name)

# @database_sync_to_async
# def delete_custom_rooms_config(room_config):
# 	room_config.delete()

########################## PlayerConsumer #########################
class PlayerConsumer(AsyncWebsocketConsumer):
	def __init__(self, *args, **kwargs):
		super().__init__(*args, **kwargs)
		self.ball_channel_name = ''
		self.paddle = Paddle()
		self.aiPaddle = Paddle(width - 10, height/2)
		self.ai = False

	async def connect(self):
		# await self.login_user(self.scope["query_string"].decode("utf-8"))
		# self.room_name = self.scope["user"].id
		# print("---> user: ", self.scope["user"].id, file=sys.stderr)
		self.room_group_name = 'game_%s' % self.room_name
		await self.channel_layer.group_add(
			self.room_group_name,
			self.channel_name
		)
		await self.accept()
		# player = await get_player(self.scope["user"])
		# player.channel_name = self.channel_name
		# player.room_group_name = self.room_group_name
		# await database_sync_to_async(player.save)()
		# print("current gamer: ", player.id, file=sys.stderr)
	
	async def connect_ai(self):
		print("connect_ai: ", file=sys.stderr)
		self.ai = True
		await self.send(text_data=json.dumps({
			'message': 'create_ball_socket',
			'group_name': self.room_group_name
		}))

	async def connect_to_game(self, e):
		print("shared group: ", file=sys.stderr)
		print("shared group: ", e["group"], file=sys.stderr)
		await self.channel_layer.group_discard(
			self.room_group_name,
			self.channel_name
		)
		self.room_group_name = e["group"]
		await self.channel_layer.group_add(
			self.room_group_name,
			self.channel_name
		)
		player = await get_player(self.scope["user"])
		player.room_group_name = self.room_group_name
		await database_sync_to_async(player.save)()
		await self.send(text_data=json.dumps({
			'message': 'create_ball_socket',
			'group_name': self.room_group_name
		}))

	async def disconnect(self, close_code):
		await self.channel_layer.send(
			self.ball_channel_name, 
			{ 'type': 'deconnect_ball' })
		await self.channel_layer.group_discard(
			self.room_group_name,
			self.channel_name
		)
		player = await get_player(self.scope["user"])
		player.channel_name = '_'
		await database_sync_to_async(player.save)()

	async def receive(self, text_data):
		text_data_json = json.loads(text_data)
		type = text_data_json['type_msg']

		print("----- type: ", type, file=sys.stderr)
		if (type == 'login'):
			await self.login_user(text_data)
		elif (type == "paddle"):
			self.paddle.update(text_data_json['ps'])
			await self.channel_layer.send(
			self.ball_channel_name,
			{
				'type': 'update_paddle_info',
				'name': self.channel_name, 
				'paddle': self.paddle.fn_data()
			})
		elif (type == "move"):
			if (self.ball_channel_name != ''):
				await self.channel_layer.send(
				self.ball_channel_name,
				{
					'type': 'move'
				})
		elif (type == "connect_ai"):
			await self.connect_ai()
		elif (type == "invitation"):
			await self.channel_layer.send(
				text_data_json['channel_name'],
				{
					'type': 'invitation',
					'channel_name': self.channel_name,
					'group_name': self.room_group_name,
					'user_name': self.scope["user"].first_name,
				}
			)
		elif (type == "accept_invitation"):
			print("accept inivtation: ", text_data, file=sys.stderr)
			await self.connect_to_game(text_data_json)

	async def invitation(self, text_data):
		await self.send(text_data=json.dumps({
			'message': 'invitation',
			'channel_name': text_data['channel_name'],
			'group_name': text_data['group_name'],
			'user_name': text_data['user_name']
		}))
	
	async def login_user(self, text_data):
		token = text_data.split('=', 1)[1]
		print("-------------token: ", token, file=sys.stderr)
		
		if (self.scope["user"] == AnonymousUser() and token):
			user_id = get_user_id(token)
			user = await get_user(user_id)
			await login(self.scope, user)
			await database_sync_to_async(self.scope["session"].save)()
 
	async def paddle_info_to_game(self, event):
		self.ball_channel_name = event['ball_channel_name']
		await self.channel_layer.send(
			self.ball_channel_name,
			{
				'type': 'paddle_info',
				'name': self.channel_name,
			}
		)
		if (self.ai):
			await self.channel_layer.send(
				self.ball_channel_name,
				{
					'type': 'paddle_info',
					'name': 'ai',
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