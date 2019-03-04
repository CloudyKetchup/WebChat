from django.shortcuts import render,redirect
from django.template.context import RequestContext
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import login,logout,authenticate
from main.forms import UserForm
import urllib.request,json,requests

def homepage(request):
    return render(request,'home.htm')


#will send to registration page,or will send registration request to server
def register(request):
	if request.method == "POST":
		#data from fields
		email = str(request.POST.get('email'))
		name = str(request.POST.get('username'))
		password = str(request.POST.get('password'))
		#json that will be send to server for registration procedure
		jsonRequest = {
			#put all data inside
			"email": email,
			"name" : name,
			"password" : password
		}
		#send registration requrest to server
		try:
			r = requests.post('http://localhost:3000/register',jsonRequest)
			#server response after request
			response = str(r) + " " + r.text
			# if response == "Account already exist":
				
			# else :
			# 	login(request,name,email,password)
			return redirect('main:homepage')
		except Exception as e:
			print(e)
	#send back to registration page
	return render(request,'registration.htm')



def login(request,name,email,password):
	#json that will be send to server for login procedure
	jsonRequest = {
	    "email" : str(request.POST.get('email')),
	    "password": str(request.POST.get('password'))
	}
	#send login request to server
	try:
		r = requests.post('http://192.168.0.14:3000/login',jsonRequest)
		return redirect('main:homepage')
	except Exception as e:
		print(e)
	return redirect('main:register')