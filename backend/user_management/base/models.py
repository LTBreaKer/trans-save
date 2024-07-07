from django.db import models

# Create your models here.

class UserProfile(models.Model):
    user_id = models.IntegerField(blank=False, null=False, unique=True)
    friends = models.ManyToManyField('self', blank=True)

    def __str__(self):
        return f"{self.user_id}'s Profile"

class FriendRequest(models.Model):
    from_user_id = models.IntegerField(null=False, blank=False, unique=True)
    to_user_id = models.IntegerField(null=False, blank=False, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'user with id: {self.from_user_id} sent friend request to user with id: {self.to_user_id}'