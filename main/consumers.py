from asgiref.sync import async_to_sync
from channels.generic.websocket import JsonWebsocketConsumer
from .models import Message
import json, requests

API_URL = 'http://localhost:3000/'


class ChatConsumer(JsonWebsocketConsumer):

    # get all user rooms from database
    def get_rooms(self,data):
        try:
            # send email to get user rooms
            r = requests.post(API_URL + 'get-rooms',{'email': data['email']})
            self.send_json({
                'response': r.json()['message'],
                'rooms': r.json()['rooms']
                })
        except Exception as e:
            print(e)

    # get all room messages from database
    def fetch_messages(self, data):
        try:
            r = requests.post(API_URL + 'fetch-messages',{'roomID': data['roomID']})
            self.send_json({
                'response': r.json()['message'],
                'messages': r.json()['messages']
                })
        except Exception as e:
            print(e)

    # create and send message to chat
    def new_message(self, data):
        message = self.message_to_json(
            Message(
                data['from'], data['message'], data['roomID']
            )
        )
        content = {
            'command': 'new_message',
            'message': message
        }
        self.message_to_database(message)
        return self.send_chat_message(content)

    # search for email in database
    def search_user(self, data):
        try:
            r = requests.post(API_URL + 'search-member', 
                {
                    'email': data['email']
                }
            )
            self.send_json({
                'response': r.json()['message'],
                'email': data['email']
                })
        except Exception as e:
            print(e)

    def new_member(self,data):
        try:
            r = requests.post(API_URL + 'new-member',
                {
                    'email':data['email'],
                    'roomID': data['roomID']
                }
            )
            self.send_json(
                {
                    'response': r.json()['message'],
                    'room': r.json()['room']
                }
            )
        except Exception as e:
            print(e)

    # create room request to API
    def create_room(self,data):
        data = {
            'roomName': data['roomName'],
            'admin': data['admin'],
            'members': data['members']
        }
        try:
            r = requests.post(API_URL + 'create-room',data)
            self.send_json({
                'response': r.json()['message']
                })
        except Exception as e:
            print(e)

    # convert message for sending to json format
    @staticmethod
    def message_to_json(message):
        return {
            'author': message.author,
            'content': message.content,
            'roomID': message.room,
            'time': str(message.time)
        }

    # connect to chat
    def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'main_%s' % self.room_name

        # join room group
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )

        self.accept()

    def disconnect(self, close_code):
        # Leave room group
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )

    commands = {
        'get_rooms': get_rooms,
        'fetch_messages': fetch_messages,
        'new_message': new_message,
        'new_member': new_member,
        'search_user': search_user,
        'create_room': create_room
    }

    # receive message from WebSocket
    def receive(self, text_data):
        data = json.loads(text_data)
        self.commands[data['command']](self, data)

    def send_chat_message(self, content):
        # send message to room group
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': content
            }
        )

    # send new message to database
    def message_to_database(self,content):
        try:
            r = requests.post(API_URL + 'new-message',
                {
                    'message': json.dumps(content)
                }
            )
        except Exception as e:
            print(e)

    # send message to WebSocket
    def chat_message(self, event):
        self.send(json.dumps(event['message']))
