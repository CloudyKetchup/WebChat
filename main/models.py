from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Message(models.Model):

    def __init__(self, author, message, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.author = author
        self.content = message

    time = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.author.username

    # Preload last 15 messages
    @staticmethod
    def last_messages():
        return Message.objects.order_by('-time').all()[:15]


class User(models.Model):

    name = None
    email = None
    password = None
    rooms = []
