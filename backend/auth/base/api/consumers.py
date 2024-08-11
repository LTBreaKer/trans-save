from channels.generic.websocket import AsyncWebsocketConsumer
import json

class OnlineStatusConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print(self.scope)
        await self.accept()
        await self.send_data()

    async def send_data(self):
        scope_data = self.prepare_scope_data()
        await self.send(text_data=json.dumps({"scope": scope_data}))

    def prepare_scope_data(self):
        # Prepare the scope data, ensuring all values are serializable
        scope_data = {}

        for key, value in self.scope.items():
            # Handle serialization of non-serializable data
            if isinstance(value, bytes):
                scope_data[key] = value.decode("utf-8")  # Convert bytes to string
            elif isinstance(value, dict):
                scope_data[key] = {str(k): str(v) for k, v in value.items()}  # Convert dict keys/values to strings
            else:
                scope_data[key] = str(value)  # Convert everything else to strings

        return scope_data
