import sys
import math
import random

width = 720
height = 360
ballRaduis = 6
paddleHeight = 60
paddleWidth = 10

class Ball():
	def __init__(self):
		self.initVelX = random.choice([2, -2])
		self.x = width / 2
		self.y = height / 2
		self.velX = self.initVelX
		self.velY = random.choice([2, -2])
		self.raduis = ballRaduis
		self.gameOver = False
		self.EndGame = False
		self.endTurn = False
		self.ballOut = 10
		self.vel = 3

	def reset(self):
		self.x = width / 2
		self.y = height / 2
		self.initVelX = -self.initVelX
		self.velX = self.initVelX
		self.velY = random.choice([2, -2])
		self.endTurn = False
		self.ballOut = 10
		self.vel = 3

	def update(self, rPaddle, lPaddle):
		if (not self.endTurn):
			if ((self.x + self.velX) >= width):
				lPaddle.nb_goal += 1
				self.endTurn = True
			elif ((self.x + self.velX) <= 0):
				rPaddle.nb_goal += 1
				self.endTurn = True
			else:
				positionRHit = rPaddle.y + paddleHeight / 2 - (self.y + self.velY)
				positionLHit = lPaddle.y + paddleHeight / 2 - (self.y + self.velY)
				if ((self.x + self.velX + self.raduis) >= (width - paddleWidth) and
				(positionRHit <= paddleHeight / 2 + self.raduis and positionRHit >= - paddleHeight / 2 - self.raduis)):
						print("rPaddle.y: " , rPaddle.y, file=sys.stderr)
						self.velX = -self.vel * math.cos(positionRHit / paddleHeight)
						self.velY = -self.vel * math.sin(positionRHit / paddleHeight)
				elif ((self.x + self.velX - self.raduis) <= (paddleWidth) and
				(positionLHit <= paddleHeight / 2 and positionLHit >= - paddleHeight / 2)):
						print("lPaddle.y: " , lPaddle.y, file=sys.stderr)
						self.velX = self.vel * math.cos(positionLHit / paddleHeight)
						self.velY = -self.vel * math.sin(positionLHit / paddleHeight)
				elif ((self.y + self.velY + self.raduis) > height or (self.y + self.velY - self.raduis) <= 0):
					self.velY = -self.velY
				self.x += self.velX
				self.y += self.velY
		else:
			self.x = self.velX
			self.y = self.velY
			self.ballOut += 1
			if (self.ballOut >= 60):
				self.gameOver = True
				self.reset()

	def fn_str(self):
		return ((f'{{"x": {self.x}, "y": {self.y}, "ballOut": {self.ballOut}}}'))
		# return (f'{{"x": {self.x}, "y": {self.y}}}')
 
	def __str__(self):
		return (f'{{"x": {self.x}, "y": {self.y}}}')