let rect = 0;
let roomsSpacing = 100;
let roomsList = [];
let room;

if (isEmptyObject(rooms)) {
    const emptyList = document.createElement("p");
}else{
    //get all rooms from rooms json
    for (room in rooms) {
        roomsList.push(room);
    }
    //generate rooms selectors for side menu
    for (room in roomsList) {
        room = document.createElement("button");
        room.setAttribute("class","room-button");
        room.setAttribute("name", type);
        room.innerHTML = room['name'].toString();

        let sideMenu = document.getElementById("rooms-container");
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
    chatSocket.send(JSON.stringify({'command': 'fetch_messages'}));
};

document.querySelector('#chat-message-input').onkeyup = function(e) {
    if (e.keyCode === 13) {  // enter, return
        document.querySelector('#chat-message-submit').click();
    }
};

document.querySelector('#chat-message-submit').onclick = function(e) {
    var input = document.querySelector('#chat-message-input');
    var message = input.value;
    chatSocket.send(JSON.stringify({
        'command': 'new_message',
        'message': message,
        'from': username
    }));
    input.value = '';
};

function renderMessage(message,author){
	let messageBody = document.createElement("p");
	document.body.children[1].appendChild(messageBody);

	messageBody.setAttribute("class","message");
	messageBody.innerHTML = message + " | " + author;
	if (author === username) {
    	messageBody.style.right = '10px';
    }
    else{	
    	messageBody.style.left = '10px';
    }
	
	messageBody.style.top = rect+"px";
	let p = $(".message");
	let position = p.position();
	rect += position.top + 50;
}

function isEmptyObject(obj){
    return (Object.getOwnPropertyNames(obj).length === 0);
}

const roomDialog = document.getElementById('create-room-dialog');

document.getElementById("create-room").onclick = function() {
    roomDialog.style.display = "block";
};

function closeRoomDialog() {
    roomDialog.style.display = "none";
}

function addMember(){
    let email = document.getElementById('user-email-field').value;

    chatSocket.send(JSON.stringify({
        'command': 'search_user',
        'email' : email
    }));
}