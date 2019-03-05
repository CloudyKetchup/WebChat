var rect = 0; 

chatSocket.onmessage = function(e) {
    var data = JSON.parse(e.data);
    var message = data['message'];
    renderMessage(message)
    // document.querySelector('#chat-log').value += (message + '\n');
};

chatSocket.onclose = function(e) {
    console.error('Chat socket closed unexpectedly');
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
        'message': message
    }));

    messageInputDom.value = '';
};

function renderMessage(message){
	var messageBody = document.createElement("p");
	document.body.children[1].appendChild(messageBody);
		
	messageBody.setAttribute("class","message");
	messageBody.innerHTML = message;

	messageBody.style.top = rect+"px";
	var p = $(".message");
	var position = p.position();
	rect += position.top+45;
}