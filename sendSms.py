# In Django, you can implement a grace period for tokens by adding a field to track the token's "grace expiration" alongside the primary expiration. The "grace expiration" allows the previous token to remain valid for a short time after a refresh, giving in-flight requests a chance to complete with the old token.

# Here’s a step-by-step way to code this:

# Step 1: Extend Your Token Model with a Grace Expiration Field
# If you’re using a custom token model, add a grace_expiration field. This field can store the timestamp for when the old token finally expires after the grace period.

# python
# Copy code
from django.db import models
from datetime import timedelta
from django.utils import timezone

class UserToken(models.Model):
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE)
    token = models.CharField(max_length=255)
    expires_at = models.DateTimeField()       # Primary expiration time
    grace_expiration = models.DateTimeField() # Grace period expiration time

    def is_expired(self):
        return timezone.now() > self.expires_at

    def is_within_grace_period(self):
        return self.expires_at < timezone.now() <= self.grace_expiration
# Step 2: Set the Grace Period during Token Refresh
# When a token refreshes, set expires_at to the new expiration time, and set grace_expiration to the previous expiration time plus a grace period (e.g., 10 seconds).

# python
# Copy code
from datetime import timedelta

def refresh_user_token(user):
    old_token = UserToken.objects.filter(user=user).last()
    
    # Set a grace period (e.g., 10 seconds)
    GRACE_PERIOD_SECONDS = 10

    # Update old token's grace expiration time
    if old_token:
        old_token.grace_expiration = old_token.expires_at + timedelta(seconds=GRACE_PERIOD_SECONDS)
        old_token.save()

    # Create a new token with a new expiration time
    new_token = generate_new_token_for_user(user)
    new_expiration = timezone.now() + timedelta(minutes=5)  # Example primary expiration in 5 minutes
    UserToken.objects.create(user=user, token=new_token, expires_at=new_expiration)
    
    return new_token
# Step 3: Modify Authentication to Check for Grace Period
# In the authentication logic (middleware or view), check if the token is expired. If it is, see if it falls within the grace period.

# python
# Copy code
from django.http import JsonResponse

def authenticate_request(request):
    token = request.headers.get('Authorization')
    if not token:
        return JsonResponse({'error': 'Token required'}, status=401)
    
    try:
        user_token = UserToken.objects.get(token=token)
    except UserToken.DoesNotExist:
        return JsonResponse({'error': 'Invalid token'}, status=401)

    # Check token validity
    if user_token.is_expired():
        # If expired, check if it's within the grace period
        if user_token.is_within_grace_period():
            return JsonResponse({'warning': 'Token expired but within grace period'}, status=200)
        else:
            return JsonResponse({'error': 'Token expired'}, status=401)

    # If not expired, token is valid
    return JsonResponse({'message': 'Token is valid'}, status=200)
# Step 4: Test the Grace Period
# Issue a Token: Generate a token with a primary expiration time and a grace_expiration field.
# Simulate Token Expiration: Try accessing the endpoint once the primary expiration time has passed but within the grace period.
# Complete Grace Period: Attempt access after the grace period ends to confirm the token is no longer valid.
# This setup ensures that only one valid token exists at a time and that overlapping requests within the grace period can complete successfully.