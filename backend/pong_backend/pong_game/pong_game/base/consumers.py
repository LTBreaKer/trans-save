import asyncio
import sys
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .ball_class import Ball
from .ball_class import width, height
from .paddle_class import Paddle
import os
import random
from django.conf import settings
# from tensorflow.keras.models import load_model
import numpy as np

class GameConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.ball = Ball()
        self.lpaddle = Paddle(0, height/2)
        self.rpaddle = Paddle(width - 10, height/2)
        self.gameOver = False

    async def connect(self):
        print("aaaaaaaaaaaaaaaaaaaaaaa", file=sys.stderr)
        await self.accept()
    
    async def disconnect(self, close_code):
        pass
    
    async def send_ball_data(self):
        while True:
            self.ball.update()
            await self.send(text_data=json.dumps({
                    'type': 'chat.message',
                    'message': self.ball.fn_str()
                }))
            await asyncio.sleep(0.4)


    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        type = text_data_json['type_msg']
          
        print("receive message: ", type, file=sys.stderr)
        if (type == "update_paddle"):
            self.lpaddle.update(text_data_json['lpaddle']['ps'])
            self.rpaddle.update(text_data_json['rpaddle']['ps'])
        elif (type == 'play'):
            self.ball.gameOver = False
            asyncio.create_task(self.update_ball(type))
        elif (type == 'stop'):
            self.ball.gameOver = True

    async def update_ball(self, event):
        print("game_over: ", self.ball.gameOver, file=sys.stderr)
        time = 0.0
        while (not self.ball.gameOver):
            if (time.is_integer()):
                self.ball.vel += 0.2
            self.ball.update(self.rpaddle, self.lpaddle)
            await asyncio.sleep(0.015625)
            time += 0.015625
            await self.send(text_data=json.dumps({
                'type': 'draw_info',
                'ball': self.ball.fn_str(),
                'left_paddle': self.lpaddle.fn_str(),	
                'right_paddle': self.rpaddle.fn_str()
            }))
            if (self.ball.gameOver and (self.lpaddle.nb_goal == 3 or self.rpaddle.nb_goal == 3)):
                await self.send_scores()
                await self.close(code=1000)
            #     self.gameOver = True
            #     self.ball.gameOver = False

    async def send_scores(self):
        await self.send(text_data=json.dumps({
            'type': 'game_over',
            'left_paddle_score': self.lpaddle.nb_goal,
            'right_paddle_score': self.rpaddle.nb_goal,
        }))
        # endpoint = "https://127.0.0.1:9006/api/gamedb/add-game-score/"
        # headers = {
        #     'Authorization': auth_header,
        # }
        # data = {
        #     'player1_name': ...
        # }
        # response = requests.post(url=endpoint, headers=headers, data=data, verify=False)
