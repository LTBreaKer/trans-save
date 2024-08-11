from channels.generic.websocket import AsyncWebsocketConsumer
import json
from .helpers import check_auth
from asgiref.sync import sync_to_async
# from base.models import OnlineStatus, UserProfile

class OnlineStatusConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        from base.models import UserProfile
        self.user_id = -1
        self.user_profile = None
        token = self.scope.get('subprotocols')[1] if self.scope.get('subprotocols') and len(self.scope.get('subprotocols')) > 1 else None
        if not token:
            await self.close(code=4000)
            return
        
        auth_header = f"Bearer {token}"

        response = await sync_to_async(check_auth)(auth_header)
        
        
        if response.status_code == 200:
            user_data = await sync_to_async(response.json)()
            self.user_id = user_data['user_data']['id']
            # Token is valid, accept the connection
            await self.channel_layer.group_add(
                f"user_{self.user_id}", self.channel_name
            )
            await self.accept(subprotocol='token')
            try:
                self.user_profile = await sync_to_async(UserProfile.objects.get)(user_id=self.user_id)
            except Exception as e:
                await self.send(text_data=json.dumps({'message': 'user not found'}))
                await self.close(code=4002)
                return
            await self.update_online_status(self.user_profile, True)
        else:
            await self.close(code=4001)

    async def disconnect(self, code):
        if self.user_id == -1 or not self.user_profile:
            return
        
        await self.channel_layer.group_discard(
            f"user_{self.user_id}", self.channel_name
        )

        await self.update_online_status(self.user_profile, False)

    async def status_update(self, event):
        await self.send(text_data=json.dumps({
            "user_id": event["user_id"],
            "is_online": event["is_online"]
        }))

    async def update_online_status(self, user_profile, status):
        from base.models import OnlineStatus
        online_status, created = await sync_to_async(OnlineStatus.objects.get_or_create)(user_profile=user_profile)
        online_status.is_online = status
        await sync_to_async(online_status.save)()

        friends = await sync_to_async(lambda: list(user_profile.friends.all()))()
        for friend in friends:
            await self.channel_layer.group_send(
                f"user_{friend.user_id}",
                {
                    'type': 'status_update',
                    'user_id': user_profile.user_id,
                    'is_online': status
                }
            )



    # async def send_data(self):
    #     scope_data = self.prepare_scope_data()
    #     await self.send(text_data=json.dumps({"scope": scope_data}))

    # def prepare_scope_data(self):
    #     # Prepare the scope data, ensuring all values are serializable
    #     scope_data = {}

    #     for key, value in self.scope.items():
    #         # Handle serialization of non-serializable data
    #         if isinstance(value, bytes):
    #             scope_data[key] = value.decode("utf-8")  # Convert bytes to string
    #         elif isinstance(value, dict):
    #             scope_data[key] = {str(k): str(v) for k, v in value.items()}  # Convert dict keys/values to strings
    #         else:
    #             scope_data[key] = str(value)  # Convert everything else to strings

    #     return scope_data

