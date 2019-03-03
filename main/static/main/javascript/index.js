var rect = 0; 
function readInput(){
	var input = document.getElementById('messageArea');
	var message = document.createElement("p");
	var string = input.value;
	if(string != ""){
		document.body.children[1].appendChild(message);
		
		message.setAttribute("class","message");
		message.innerHTML = string;

		message.style.top = rect+"px";
		var p = $(".message");
		var position = p.position();
		rect += position.top+45;
		document.getElementById("messageArea").value = '';
		console.log(position.top);
	}
}
function readInputkey(){
	var input = document.getElementById('messageArea');
	var message = document.createElement("p");
	var string = input.value;
	if(string != "" && event.keyCode == 13){
		document.body.children[1].appendChild(message);
		
		message.setAttribute("class","message");
		message.innerHTML = string;

		message.style.top = rect+"px";
		var p = $(".message");
		var position = p.position();
		rect += position.top+45;
		console.log(position.top);
	}
}