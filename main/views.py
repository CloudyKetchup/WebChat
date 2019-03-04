import requests,socket
from threading import Thread
from django.shortcuts import render, redirect

# user data
name = None
email = None
password = None


# def listen_to_messages():
# 	s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
# 	s.connect('localhost',12000)
# 	while True:
# 		string = ""
# 		chunk = s.recv()


def homepage(request):
    return render(request, 'home.htm')


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
            # login(request,name,email,password)
            return redirect('main:homepage')
        except Exception as e:
            print(e)
    # send back to registration page
    return render(request, 'registration.htm')


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
            return redirect('main:homepage')
        else:
            print("Login Fail")
    except Exception as e:
        print(e)
    return redirect('main:register')
