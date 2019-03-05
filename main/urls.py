from threading import Thread
from django.urls import path
from django.conf.urls import url
from .views import *

app_name = "main"

urlpatterns = [
	path('',homepage ,name = "homepage"),
	path('register',register,name = "register"),
	url(r'^(?P<room_name>[^/]+)/$', room, name='room'),
]