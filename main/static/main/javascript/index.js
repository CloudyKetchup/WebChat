let rect;               // used for render of new message lower of previous
let members = [];       // members list in new room dialog
let selectedRoom = '';  // room id of selected room from side panel
const roomDialog = document.getElementById('create-room-dialog');
const roomNameField = document.querySelector('#room-name-field');
const errorField = document.getElementById('field-error');

// handle incoming socket message
chatSocket.onmessage = (e) => {
    data = JSON.parse(e.data);
    // handler
    responseHandler(data);
};

chatSocket.onopen = () => 
    getRooms();


chatSocket.onclose = (e) => 
    console.error("socket closed" + e);


document.querySelector('#chat-message-input').onkeyup = (e) => {
    if (e.keyCode === 13) { // enter, return
        document.querySelector('#chat-message-submit').click();
    }
};

roomNameField.onkeyup = () => 
    errorField.style.display = "none";

// send message to socket
document.querySelector('#chat-message-submit').onclick = () => {
    let message = document.querySelector('#chat-message-input').value;
    chatSocket.send(JSON.stringify({
        'command': 'new_message',
        'message': message,
        'from': username,
        'roomID': selectedRoom
    }));
    // empty message field when message sended
    message = '';
};

document.getElementById("create-room").onclick = () => {
    // spawn dialog for new room
    roomDialog.style.display = "block";
};

// show error in new room dialog
function roomFormError(response){
    const error = $('#field-error');
    error.css('display','block');
    error.html(response); 
}

// render list of rooms in side panel 
function renderRoomsList(response){
    for (let i = 0; i < response['rooms'].length; i++) {
        let roomButton = document.createElement("button");
        // room from response
        const room = response['rooms'][i];
        // add room button to side panel
        $('#rooms-container').append(roomButton);

        // set style
        roomButton.setAttribute("class","room");
        roomButton.onclick = () => showRoom(room,response);
        // set room name as button text
        roomButton.innerHTML = response['rooms'][i]['name'];
    }
}
// show room when choosen from side panel
function showRoom(room,response){
    // selected room ID
    selectedRoom = String(room['_id']);
    // change top distance of messages to default
    rect = 5;
    // empty room if another was opened before
    $('#chat-box').empty();
    // spawn room elements
    $('#chat-message-submit,#message-input-container,#chat-bar')
        .css('display','block');
    // set title to room name
    $('#chat-title').html(
        room['name']
    );
    // get room messages from database
    fetchMessages(selectedRoom);
}

// new message in chat box
function renderMessage(message,author){
    // create message div
    const messageBody = document.createElement("div");
	// add to chat box
    $("#chat-box").append(messageBody);
    messageBody.setAttribute("class","message");
	/* if user is author of message 
     * render to right side in dark theme
     * else to left with white theme
     */
    if (author === username) {
        messageBody.innerHTML = message + " | " + author;
    	messageBody.style.right = '10px';
    }
    else{
        messageBody.innerHTML = author + " | " + message;
        messageBody.style.background = "#fefefe";
        messageBody.style.color = "#242633";
    }
	// render to top with specific distance
	messageBody.style.top = rect + "px";
	const p = $(".message");
	const position = p.position();
    /* add distance for future message 
     * to render lower 
     */
	rect += position.top + 50;
}
// get user rooms list
function getRooms(){
    chatSocket.send(JSON.stringify({
        'command': 'get_rooms',
        'email': accountEmail
    }))
}

// get messages from selected room
function fetchMessages(room){
    chatSocket.send(JSON.stringify({
        'command': 'fetch_messages',
        'roomID': room
    }));
}
// handle incoming room messages
function handleFetchMessages(messages){
    for (m in messages) {
        const message = messages[m]
        renderMessage(message['content'],message['author']);
    }
}

// check if object is null
function isEmptyObject(obj){
    return (Object.getOwnPropertyNames(obj).length === 0);
}

function closeDialog() {
    members = [];
    roomDialog.style.display = "none";
}
// add member to list for new room
function memberToList(data){
    if (data['name'] != username) {
        // add to list member email
        members.push(data['email']);
        // update members number in dialog
        $("#members").html("Members : " + members.length);
        // empty email field
        $("#user-email-field").val ('');
    }else {
        roomFormError("You can't add yourself");
    }
}
// search if new member exist in database
function searchMember(){
    // email field text
    const email = document.getElementById('user-email-field').value;
    if (email != null && !members.includes(email)) {
        chatSocket.send(JSON.stringify({
            'command': 'search_user',
            'email': email
        }));
    }else if(members.includes(email)) {
        roomFormError("Member already added");
    }else {
        roomFormError("Member field empty");
    }
}

function createRoom(){
    if (!members.includes(accountEmail)) {
        members.push(accountEmail);    
    }
    if (roomNameField.value === "") {
        roomFormError("Room name cannot be empty");
    }else {
        chatSocket.send(JSON.stringify({
            'command': 'create_room',
            'roomName': roomNameField.value,
            'admin': accountEmail,
            'members': members
        }));
    }
}

// handle all socket incoming data
function responseHandler(response){
    switch (response['response']) {
        // add to list member for new room 
        case 'Member exist':
            memberToList(response);
            break;
        case 'User with that email does not exist':
            roomFormError(response['response']);
            break;
        case 'Room already exist':
            roomFormError(response['response']);
            break;
        // close dialog and get rooms
        case 'Room created':
            closeRoomDialog();
            getRooms();
            break;
        case 'Message added':
            break;
        // get user rooms data
        case 'User rooms':
            renderRoomsList(response);
            break;
        // handle incoming messages when open room
        case 'Messages':
            handleFetchMessages(response['messages']);
            break;
        // render message in chat
        default:
            let message = response['message'];
            renderMessage(
                message['content'],
                message['author']
            )
            break;
    }
}