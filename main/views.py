import json
import requests
from django.shortcuts import render, redirect
from django.utils.safestring import mark_safe
from main.models import User


def homepage(request):
    return render(request, 'login_page.htm')


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
                print(r.text)
            else:
                login(request)
            return redirect('main:homepage')
        except Exception as e:
            print(e)
    # send back to registration page
    return render(request, 'registration.htm')


# will send login request to server
def login(request):
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
            if response_message != "Login success":
                print(response_message)
            else:
                return render(request, 'room.html', {
                    'room_name_json': mark_safe(json.dumps("lobby")),
                    'username': mark_safe(json.dumps(User.name))
                })
        except Exception as e:
            print(e)
    # send back to login
    return render(request, 'login_page.htm')
