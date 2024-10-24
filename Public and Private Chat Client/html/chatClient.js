//connect to server and retain the socket
//connect to same host that served the document

//const socket = io('http://' + window.document.location.host)
const socket = io() //by default connects to same server that served the page
//disable chatting capabilties initially
document.getElementById('msgBox').disabled = true
document.getElementById('send_button').disabled = true
document.getElementById('clear_button').disabled = true

//div area that acknowledges a new user
let userBoxVar = document.getElementById('userBox')
let newUserBox = document.getElementById('connect')
let flag = false
let currentUserName = ''

//recieves and emit from server for broadcasting to all users in chat client
socket.on('serverSays', data => {
  let msgDiv = document.createElement('div')
  //check to see if the msg must be displayed in the users text format or another users format
  if (data.name === currentUserName) {
    msgDiv.innerHTML += `<div class="user_message">${data.name}: ${data.message}</div>`
  } else {
    msgDiv.innerHTML += `<div class="alternate_message">${data.name}: ${data.message}</div>`
  }
  //users who are not registered will not recieve the msg
  if (flag == true) {
    document.getElementById('messages').appendChild(msgDiv)
  }
})

//recieves and emit from server for broadcasting to private/group msgs in chat client
socket.on('privateServerSays', data => {
  //displays the msg in the specified format
  let msgDiv = document.createElement('div')
  msgDiv.innerHTML += `<div class="private_message">${data.name}: ${data.message}</div>`
  document.getElementById('messages').appendChild(msgDiv)
})

//function to distinguish between a global/private msg
function sendMessage() {
  //initialize variables
  let message = document.getElementById('msgBox').value.trim()
  let privMsg = ''
  let receivers = []
  //base case
  if(message === '') return //do nothing
  //private/group msging - finds the recipients and msg to be sent
  if (message.includes(':') || message.includes(' :') || message.includes(': ') ) {
    //strips the users and msg and adds to the receivers array
    let newMsg = message.split(':')
    receivers = newMsg[0].split(',').map(receiver => receiver.trim())
    message = newMsg[1].trim()
  }
  //if it was a private/group msg, send to specified recipients, otherwise its global
  if (receivers.length > 0) {
    //sends to server for processing
    privMsg = {recipients: receivers, message: message}
    socket.emit('privateClientSays', privMsg)
  } else {
    socket.emit('clientSays', message)
  }
  //clear the msg box
  document.getElementById('msgBox').value = ''
}

//function to establish connection to the chat server
function establishConnection() {
  //get the user name
  user = document.getElementById('userBox').value
  //checks validity of username
  if (validUser(user) == true) {
    document.getElementById('userBox').disabled = true
    document.getElementById('establish_connection_button').disabled = true
    //if a user is registered or not
    displayUser()
    socket.emit('store-user', user)
    flag = true
    //clear the user box
    currentUserName = user
    document.getElementById('userBox').value = ''
    let msgDiv = document.createElement('div')
    msgDiv.textContent = 'note: groups/private msgs should be in the format of...RECIPIENT: MSG TO BE SENT'
    document.getElementById('messages').appendChild(msgDiv)
    enableChatting()
  } 
}

//function to enforce a valid user name upon the user
function validUser(name) {
  //checks to see if the user has a valid username
  for (let letter of "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ") {
    if (name.startsWith(letter) == true) {
      //checks to see if the user has a valid username
      if (/^[A-Za-z0-9]+$/.test(name)) {
        return true
      }
    }
  }
  //clear the username box and stop any successful connection
  document.getElementById('userBox').value = ''
  return false;
}

//function to enable the chatting features
function enableChatting() {
  //re-enable the HTML elements
  document.getElementById('msgBox').disabled = false
  document.getElementById('send_button').disabled = false
  document.getElementById('clear_button').disabled = false

}

//display unique welcome msg to the user to acknowledge a successful user connection
function displayUser() {
  newUserBox.innerHTML = 'Welcome to the chatting server, ' + userBoxVar.value + "!"
}

//clears the users screen of all chat contents
function clearUser() {
  //removes each element on the screen until none remain
  const userScreen = document.getElementById('messages')
  while (userScreen.firstChild) {
    userScreen.removeChild(userScreen.firstChild)
  }
  //display unique clear msg to the user to acknowledge a successful chat board clear
  let msgDiv = document.createElement('div')
  msgDiv.textContent = '(SUCESSFULLY CLEARED)'
  document.getElementById('messages').appendChild(msgDiv)
}

