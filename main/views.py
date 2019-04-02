import json,requests
from django.shortcuts import render, redirect
from django.utils.safestring import mark_safe

user = {
    'email': None,
    'name' : None,
    'password' : None
}

API_URL = 'http://localhost:3000/'

def homepage(request):
    # if logged redirect to chat
    if user['name'] != None:
        return redirect('main:room',room_name='chat')
    return redirect('main:login')


def room(request, room_name):
    # if not logged in,redirect to login page
    if user['name'] == None:
        return redirect('main:login')
    return render(request, 'room.html', {
        'room_name_json': mark_safe(json.dumps(room_name)),
        'email': mark_safe(json.dumps(user['email'])),
        'username': mark_safe(json.dumps(user['name']))
    })


# will send to registration page or registration request to API
def register(request):
    if request.method == "POST":
        # send registration request to API
        register_request(register_data(request))
    # send back to registration page
    return render(request,'registration.htm')


def login(request):
    if request.method == "POST":
        return login_request(login_data(request),request)
    return render(request,'login_page.htm')


def register_request(json):
    try:
        r = requests.post(API_URL + 'register', json)
        # API response
        if r.text == "Registration success":
            return login_request(json)
        else:
            return redirect('main:register')
    except Exception as e:
        print(e)

# send login request to API
def login_request(json,request):
    try:
        r = requests.post(API_URL + 'login', json)
        setup_user(r.json())
        if r.json()['message'] == "Login success":
            return redirect('main:room',room_name='chat')
        else:
            render(request,'login_page.htm')
    except Exception as e:
        print(e)

# json data for request
def register_data(request):
    return {
        "email": str(request.POST.get('email')),
        "name": str(request.POST.get('username')),
        "password": str(request.POST.get('password'))
    }

# json data for login
def login_data(request):
    return {
        "email": str(request.POST.get('email')),
        "password": str(request.POST.get('password'))
    }

# setup user dictionary
def setup_user(response):
    user['name']  = response['name']
    user['email'] = response['email']
