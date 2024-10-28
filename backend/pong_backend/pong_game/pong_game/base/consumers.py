import asyncio
import sys
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .ball_class import Ball
from .ball_class import width, height
from .paddle_class import Paddle
import os
import random
from django.conf import settings
from tensorflow.keras.models import load_model
import numpy as np
from .models import TrainingData, Turn

goals_to_win = 5
@database_sync_to_async
def output_pos_hit(pos_hit):
	try:
		TrainingData.objects.filter(pos_hit=-1).update(pos_hit=pos_hit)
	except:
		None

class LocalGameConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.ball = Ball()
        self.lpaddle = Paddle(0, height/2)
        self.rpaddle = Paddle(width - 10, height/2)
        self.gameOver = False
        self.bot = False

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
        elif (type == "update_rpaddle"):
            self.bot = True
            self.rpaddle.update(text_data_json['rpaddle']['ps'])
        elif (type == 'play'):
            self.ball.gameOver = False
            asyncio.create_task(self.update_ball(type))
        elif (type == 'stop'):
            self.ball.gameOver = True
        elif (type == "close"):
            await self.close(code=1000)

    async def update_ball(self, event):
        print("game_over: ", self.ball.gameOver, file=sys.stderr)
        turn = await Turn.objects.acreate()
        time = 0.0
        model_path = os.path.join(settings.BASE_DIR, 'base/agent_model/test_model.h5')
        # model_path = os.path.join(settings.BASE_DIR, 'base/agent_model/model4700_300.h5')
        model = load_model(model_path)
        numbers = [20, 20, 20, 50, 50, 50]
        while (not self.ball.gameOver):
            tmp = self.ball.velX
            pos_hit = self.ball.y
            if (time.is_integer()):
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
                if (self.bot or time == 0.0):
                    input_values = [self.ball.x / 10, self.ball.y / 10, self.ball.velX, self.ball.velY]
                    input_array = np.array(input_values).reshape(1, -1)
                    predictions = model.predict(input_array)
                    random_number = random.choice(numbers)
            if (self.bot):
                self.lpaddle.ai_update(predictions * 10 - random_number)
            self.ball.update(self.rpaddle, self.lpaddle)
            if ((self.ball.velX * tmp < 0)):
                tmp = self.ball.velX
                await output_pos_hit(pos_hit)
            if ((self.ball.endTurn and self.ball.ballOut <= 11)):
                await output_pos_hit(pos_hit)
            await asyncio.sleep(0.015625)
            time += 0.015625
            await self.send(text_data=json.dumps({
                'type': 'draw_info',
                'ball': self.ball.fn_str(),
                'left_paddle': self.lpaddle.fn_str(),	
                'right_paddle': self.rpaddle.fn_str()
            }))
            if (self.ball.gameOver and (self.lpaddle.nb_goal == goals_to_win or self.rpaddle.nb_goal == goals_to_win)):
                await self.send_scores()
                await self.close(code=1000)
            #     self.gameOver = True
            #     self.ball.gameOver = False

    async def send_scores(self):
        print("--------------send score------------", file=sys.stderr)
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
