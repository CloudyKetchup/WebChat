let rect = 0;
let roomsSpacing = 100;
let roomsList = [];
let room;
var members = [];
const roomDialog = document.getElementById('create-room-dialog');
const roomNameField = document.querySelector('#room-name-field');
const errorField = document.getElementById('field-error');

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
    data = JSON.parse(e.data);
    response = data['response'];
    switch (response) {
        case 'Member exist':
            memberToList(data);
            break;
        case 'User with that name does not exist':
            const error = document.getElementById('error-field');
            error.style.display = "block";
            error.innerHTML = response; 
            break;
        default:
            var message = data['message'];
            if (message['content'] != null) {
                renderMessage(
                    message['content'],
                    message['author'])
            }
            break;
    }
};

chatSocket.onclose = function(e) {
    console.error("socket closed");
};

// chatSocket.onopen = function(e) {
//     chatSocket.send(JSON.stringify({'command': 'fetch_messages'}));
// };

document.querySelector('#chat-message-input').onkeyup = function(e) {
    if (e.keyCode === 13) {  // enter, return
        document.querySelector('#chat-message-submit').click();
    }
};

roomNameField.onkeyup = function(){
    errorField.style.display = "none";
}

document.querySelector('#chat-message-submit').onclick = function(e) {
    let input = document.querySelector('#chat-message-input');
    let message = input.value;
    chatSocket.send(JSON.stringify({
        'command': 'new_message',
        'message': message,
        'from': username
    }));
    input.value = '';
};

document.getElementById("create-room").onclick = function() {
    roomDialog.style.display = "block";
};

function memberToList(data){
    if (data['name'] != username) {
        let membersDOM = document.getElementById('members');
        let emailField = document.getElementById('user-email-field');
        if (!members.includes(data['email'])) {
            members.push(data['email']);
            membersDOM.innerHTML = "Members : " + members.length;
            emailField.value = '';
        }
    }else {
        console.log("You can't add your self");
    }
}

function renderMessage(message,author){
	let messageBody = document.createElement("p");
	document.body.children[1].appendChild(messageBody);

	messageBody.setAttribute("class","message");
	if (author === username) {
        messageBody.innerHTML = message + " | " + author;
    	messageBody.style.right = '10px';
    }
    else{
        messageBody.innerHTML = author + " | " + message;
        messageBody.style.background = "#fefefe";
        messageBody.style.color = "#242633";
    	messageBody.style.left = '11%';
    }
	
	messageBody.style.top = rect+"px";
	let p = $(".message");
	let position = p.position();
	rect += position.top + 50;
}

function isEmptyObject(obj){
    return (Object.getOwnPropertyNames(obj).length === 0);
}

function closeRoomDialog() {
    members = [];
    roomDialog.style.display = "none";
}

function addMember(){
    let email = document.getElementById('user-email-field').value;

    if (email != null) {
        chatSocket.send(JSON.stringify({
            'command': 'search_user',
            'email': email
        }));
    }
}
function createRoom(){
    membersJson = {}
    for (let i = 0; i < members.length;i++) {
        let user = 'member' + i;
        membersJson[user] = members[i];
    }
    createRoomRequest(membersJson);
}

function createRoomRequest(membersJson){
    dataJson = {
        'command': 'create_room',
        'roomName': roomNameField.value,
        'admin': username,
        'members': membersJson
    }
    if (roomNameField.value === "") {
        errorField.style.display = "block";
        errorField.innerHTML = "Room name cannot be empty";
    }else {
        chatSocket.send(JSON.stringify(dataJson));
    }
}