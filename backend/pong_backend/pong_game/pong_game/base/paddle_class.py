import sys
from .ball_class import height, paddleHeight

class Paddle(): 
	def __init__(self, x=0, y=height/2):
		self.x = x
		self.y = y 
		self.nb_goal = 0
 
	def update(self, ps):
		# print("paddle class: ", ps, file=sys.stderr)
		self.x = int(ps['x'])
		self.y = int(ps['y'])
	
	def ai_update(self, y):
		y = max(min(y, height - paddleHeight), 0)
		if (y < self.y):
			self.y = max(self.y - 5, y)
		elif (y > self.y):
			self.y = min(self.y + 5, y)

	
	def fn_str(self):
		return (f'{{"x": {self.x}, "y": {self.y}, "nb_goal": {self.nb_goal}}}')
	  
	def fn_data(self):
		return {'x': self.x, 'y': self.y, 'nb_goal': self.nb_goal}

	def __str__(self):
		return (f'{{x: {self.x}, y: {self.y}, nb_goal: {self.nb_goal}}}')
