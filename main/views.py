import json
import requests
from django.shortcuts import render, redirect
from django.utils.safestring import mark_safe
from main.models import User


def homepage(request):
    if User.name == None:
        login(request)
    else:
        render(request,'room.html')
    return redirect('main:login')


def room(request, room_name):
    return render(request, 'room.html', {
        'room_name_json': room_name,
        'username': mark_safe(json.dumps(User.name))
    })


# will send to registration page or registration request to server
def register(request):
    if request.method == "POST":
        # json that will be send to server for registration procedure
        json_request = {
            # put all data inside
            "email": str(request.POST.get('email')),
            "name": str(request.POST.get('username')),
            "password": str(request.POST.get('password'))
        }
        # send registration request to server
        try:
            r = requests.post('http://localhost:3000/register', json_request)
            # server response after request
            if r.text != "Registration success":
                render(request,'registration.htm')
            else:
                return login(request)
        except Exception as e:
            print(e)
    # send back to registration page
    return render(request,'registration.htm')


def login(request):
    # login button action
    if request.method == "POST":
        # json that will be send to server for login procedure
        json_request = {
            # put data
            "email": str(request.POST.get('email')),
            "password": str(request.POST.get('password'))
        }
        # send login request to server
        try:
            r = requests.post('http://localhost:3000/login', json_request)
            # server response after request
            response = r.json()
            response_message = response['message']
            User.name = response['name']
            for room in response['rooms']:
                User.rooms.append(room)
            if response_message == "Login success":
                return redirect('main:room',room_name='chat')
                # return render(request, 'room.html', {
                #     'room_name_json': 'chat',
                #     'username': mark_safe(json.dumps(User.name))
                # })
            else:
                return login(request)
        except Exception as e:
            print(e)
    return render(request,'login_page.htm')
