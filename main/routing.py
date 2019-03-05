from django.conf.urls import url

from . import consumers

websocket_urlpatterns = [
    url(r'^ws/main/(?P<room_name>[^/]+)/$', consumers.User),
]