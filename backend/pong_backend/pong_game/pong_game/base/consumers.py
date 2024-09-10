import asyncio
import sys
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .ball_class import Ball
from .ball_class import width, height
from .paddle_class import Paddle

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
            self.gameOver = False
            asyncio.create_task(self.update_ball(type))
        elif (type == 'stop'):
            self.ball.gameOver = True

    async def update_ball(self, event):
        print("game_over: ", self.ball.gameOver, file=sys.stderr)
        time = 0.0
        while (not self.gameOver):
            print("self.ball.vel: ", self.ball.vel, file=sys.stderr)
            self.ball.update(self.rpaddle, self.lpaddle)
            if (time.is_integer()):
                self.ball.vel += 0.2
            await asyncio.sleep(0.015625)
            time += 0.015625
            await self.send(text_data=json.dumps({
                'type': 'draw_info',
                'ball': self.ball.fn_str(),
                'left_paddle': self.lpaddle.fn_str(),	
                'right_paddle': self.rpaddle.fn_str()
            }))
            if (self.ball.gameOver):
                self.gameOver = True
                self.ball.gameOver = False