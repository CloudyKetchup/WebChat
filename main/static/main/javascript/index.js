var rect = 0; 

chatSocket.onmessage = function(e) {
    var data = JSON.parse(e.data);

    var messages = data['messages'];
    var message = messages['content']
    var author = messages['author'];
    if (message != null) {
         renderMessage(message,author)
    }
};

chatSocket.onclose = function(e) {
    console.error('Chat socket closed unexpectedly');
};

chatSocket.onopen = function(e) {
    chatSocket.send(JSON.stringify({'command': 'fetch_messages' }));
};

document.querySelector('#chat-message-input').onkeyup = function(e) {
    if (e.keyCode === 13) {  // enter, return
        document.querySelector('#chat-message-submit').click();
    }
};

document.querySelector('#chat-message-submit').onclick = function(e) {
    var messageInputDom = document.querySelector('#chat-message-input');
    var message = messageInputDom.value;
    chatSocket.send(JSON.stringify({
        'command': 'new_message',
        'message': message,
        'from': username
    }));

    messageInputDom.value = '';
};

function renderMessage(message,author){
	var messageBody = document.createElement("p");
	document.body.children[1].appendChild(messageBody);

	messageBody.setAttribute("class","message");
	messageBody.innerHTML = message + " | " + author;
	if (author === username) {
    	messageBody.style.right = '5px';
    }
    else{	
    	messageBody.style.left = '5px';
    }
	
	messageBody.style.top = rect+"px";
	var p = $(".message");
	var position = p.position();
	rect += position.top+50;
}