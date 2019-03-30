let rect;   // used for render of new message lower of previous
let members         = [];   // members list in new room dialog
let rooms           = [];   // rooms list
let selectedRoom    = {};   // room selected from side panel
let optionsOpened   = false;
const roomDialog    = document.getElementById('create-room-dialog');
const roomNameField = document.querySelector('#room-name-field');
const errorField    = document.getElementById('field-error');

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
    let message = document.querySelector('#chat-message-input');
    // check if input field is not empty
    if (message.value != '') {
        chatSocket.send(JSON.stringify({
            'command': 'new_message',
            'message': message.value,
            'from': username,
            'roomID': selectedRoom['_id']
        }));    
    }
    // empty message field when message sended
    message.value = '';
};

document.getElementById("create-room").onclick = () => 
    // spawn dialog for new room
    roomDialog.style.display = "block";

document.getElementById("room-options").onclick = () => {
    optionsOpened = true;
    document.getElementById("room-options-dialog").style.display = "block";
}
// add room member from room options
document.getElementById("add-room-member").onclick = () => {
    const email = $('#options-email-field').val();
    searchMember(email);   
}
// add room member from new room dialog
document.getElementById("add-room-members").onclick = () => {
    const email = $('#user-email-field').val();
    searchMember(email);
}

// scroll to bottom of chatBox
function scrollBottom(){
    let chatBox = document.getElementById('chat-box');
    chatBox.scrollTop = chatBox.scrollHeight;
}

// show error in new room dialog
function roomFormError(response){
    const error = $('#field-error');
    error.css('display','block');
    error.html(response); 
}

// render list of rooms in side panel 
function renderRoomsList(response){
    $('.room').remove();
    for (let i = 0; i < response['rooms'].length; i++) {
        let roomButton = document.createElement("button");
        // room from response
        const room = response['rooms'][i];
        // add room to list
        rooms.push(room);
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
    selectedRoom = room;
    // change top distance of messages to default
    rect = 5;
    // empty room if another was opened before
    $('#chat-box').empty();
    // spawn room elements
    $('#chat-message-submit,#message-input-container,#chat-bar')
        .css('display','block');
    // set title to room name
    $('#chat-title').html(room['name']);
    $('#chat-members-count').html(selectedRoom['members'].length + ' members')
    // get room messages from database
    fetchMessages(selectedRoom['_id']);
}

// new message in chat box
function renderMessage(message,author){
    // create message div
    const mesageBody = document.createElement("pre");
    let messageContent;
    messageContent = document.createElement("pre");
    mesageBody.append(messageContent);
    messageContent.innerHTML = message;
	// add to chat box
    $("#chat-box").append(mesageBody);
    // render message on left/right side 
    if (author === username) {
        mesageBody.setAttribute("class","right-message-body");
        messageContent.setAttribute("class","right-message-content");
    } else {
        mesageBody.setAttribute("class","left-message-body");
        messageContent.setAttribute("class","left-message-content");
    }
	// render to top with specific distance
	mesageBody.style.top = rect + "px";
    /* add distance for future message 
     * to render lower 
     */
	rect += 50;
    // scroll to bottom when added new message
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
    scrollBottom();
}
// close room options popup
function closeRoomOptions() {
    optionsOpened = false;
    members = [];
    document.getElementById("room-options-dialog").style.display = "none";
}
// close new room popup
function closeRoomCreate() {
    members = [];
    roomDialog.style.display = "none";
}
// add member to list for new room
function memberToList(data){
    console.log(data);
    if (data['email'] != accountEmail) {
        // add to list member email
        members.push(data['email']);
        if (optionsOpened) {
            newMember(data['email'],selectedRoom);
            $('#room-options-dialog').css('display','none');
        }
        console.log(data['name']);
        // update members number in dialog
        $("#members").html("Members : " + members.length);
        // empty email field
        $("#user-email-field").val ('');
    }else {
        roomFormError("You can't add yourself");
    }
}
// add new member to room
function newMember(email,room){
    chatSocket.send(JSON.stringify({
        'command': 'new_member',
        'roomID': room['_id'],
        'email': email
    }));
}
// search if new member exist in database
function searchMember(email){
    if (email != '' && !members.includes(email)) {
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

function deleteRoom(){
    console.log(selectedRoom);
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
            closeRoomCreate();
            getRooms();
            break;
        // refresh rooms if updated
        case 'Room updated':
            getRooms();
            showRoom(response['room']);
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
            scrollBottom();
            break;
    }
}
