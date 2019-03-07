import json
import requests
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from django.utils.safestring import mark_safe

# user data
name = "maxim"
email = None
password = None


def homepage(request):
    return render(request, 'home.htm')


def room(request, room_name):
    print(mark_safe(json.dumps(name)))
    return render(request, 'room.html', {
        'room_name_json': mark_safe(json.dumps(room_name)),
        'username': mark_safe(json.dumps(name))
    })


# will send to registration page or registration request to server
def register(request):
    if request.method == "POST":
        # data from fields
        name = str(request.POST.get('username'))
        email = str(request.POST.get('email'))
        password = str(request.POST.get('password'))
        # json that will be send to server for registration procedure
        json_request = {
            # put all data inside
            "email": email,
            "name": name,
            "password": password
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
    return render(request,'registration.htm')


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
            if r.text != "Login success":
                print(r.text)
            else:
                return render(request, 'room.html', {
                    'room_name_json': mark_safe(json.dumps("lobby")),
                    'username': mark_safe(json.dumps(name))
                })
        except Exception as e:
            print(e)
    #send back to login
    return render(request,'login_page.htm')
