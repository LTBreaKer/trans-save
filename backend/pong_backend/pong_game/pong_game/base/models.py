from django.db import models

# Create your models here.

#################
# training AI  #

class Turn(models.Model):
    id = models.AutoField(primary_key=True)

class TrainingData(models.Model):
	turn = models.ForeignKey(Turn, on_delete=models.CASCADE, related_name='data')
	y_left_paddle = models.PositiveSmallIntegerField() 
	y_right_paddle = models.PositiveSmallIntegerField()
	x_ball = models.FloatField()
	y_ball = models.FloatField()
	vel_x_ball = models.FloatField()
	vel_y_ball = models.FloatField()
	pos_hit = models.FloatField(default=-1)
	predict_pos_hit = models.FloatField(null=True, default=-1)
	time = models.FloatField()
	collision = models.BooleanField(default = False)