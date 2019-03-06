import json
import requests
from django.shortcuts import render, redirect
from django.utils.safestring import mark_safe

# user data
name = None
email = None
password = None


def homepage(request):
    return render(request, 'home.htm')


def room(request, room_name):
    return render(request, 'room.html', {
        'room_name_json': mark_safe(json.dumps(room_name))
    })


# will send to registration page,or will send registration request to server
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
    # json that will be send to server for login procedure
    json_request = {
        # put data
        "email": str(request.POST.get('email')),
        "password": str(request.POST.get('password'))
    }
    # send login request to server
    try:
        r = requests.post('http://192.168.0.14:3000/login', json_request)
        if r.text == name + " Login Succes":
            consumers.User.name = name
            print(consumers.User.name)
            return redirect('main:homepage')
        else:
            print("Login Fail")
    except Exception as e:
        print(e)
    return redirect('main:register')
