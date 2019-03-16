var rect = 0;
var roomsSpacing = 100;
var roomsList = [];

if (!isEmptyObject(rooms)) {
    //get all romms from rooms json
    for (var room in rooms) {
        roomsList.push(room);
    }
    //generate rooms selectors for side menu
    for (room in roomsList) {
        var room = document.createElement("button");
        room.setAttribute("class","room-button")
        room.setAttribute("name", type);
        room.innerHTML = room['name'].toString();

        var sideMenu = document.getElementById("rooms-container");
        sideMenu.appendChild(room);
        room.style.top = roomsSpacing+"px";
        roomsSpacing += 50;
    }
}
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
function isEmptyObject(obj){
  return (Object.getOwnPropertyNames(obj).length === 0);
}