from django.shortcuts import render,redirect
from django.template.context import RequestContext
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import login,logout,authenticate
from main.forms import UserForm
import requests

def homepage(request):
    return render(request,'home.htm')

#will send to registration page,or will send registration request to server
def register(request):
	if request.method == "POST":
		#json that will be send to server for registration procedure
		jsonRequest = {
			#put all data inside
			"email": str(request.POST.get('email')),
			"name" : str(request.POST.get('username')),
			"password" : str(request.POST.get('password'))
		}
		#send POST requrest to server
		try:
			r = requests.post('http://192.168.0.14:3000/register',jsonRequest)
			return redirect('main:homepage')
		except Exception as e:
			print(e)
		
	#send to registration page
	else:
	    return render(request,'registration.htm')
	