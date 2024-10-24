/*
(c) 2023 Louis D. Nel
Based on:
https://socket.io
see in particular:
https://socket.io/docs/
https://socket.io/get-started/chat/
*/
//-----base code from prof lecture notes begins---------
const server = require('http').createServer(handler)
const io = require('socket.io')(server) //wrap server app in socket io capability
const fs = require('fs') //file system to server static files
const url = require('url'); //to parse url strings
const PORT = process.argv[2] || process.env.PORT || 3000 //useful if you want to specify port through environment variable
                                                         //or command-line arguments

const ROOT_DIR = 'html' //dir to serve static files from
//data base objects 
const users_database = {}
const socket_database = {}

const MIME_TYPES = {
  'css': 'text/css',
  'gif': 'image/gif',
  'htm': 'text/html',
  'html': 'text/html',
  'ico': 'image/x-icon',
  'jpeg': 'image/jpeg',
  'jpg': 'image/jpeg',
  'js': 'application/javascript',
  'json': 'application/json',
  'png': 'image/png',
  'svg': 'image/svg+xml',
  'txt': 'text/plain'
}

function get_mime(filename) {
  for (let ext in MIME_TYPES) {
    if (filename.indexOf(ext, filename.length - ext.length) !== -1) {
      return MIME_TYPES[ext]
    }
  }
  return MIME_TYPES['txt']
}

server.listen(PORT) //start http server listening on PORT

function handler(request, response) {
  //handler for http server requests including static files
  let urlObj = url.parse(request.url, true, false)
  console.log('\n============================')
  console.log("PATHNAME: " + urlObj.pathname)
  console.log("REQUEST: " + ROOT_DIR + urlObj.pathname)
  console.log("METHOD: " + request.method)

  let filePath = ROOT_DIR + urlObj.pathname
  if (urlObj.pathname === '/') filePath = ROOT_DIR + '/index.html'

  fs.readFile(filePath, function(err, data) {
    if (err) {
      //report error to console
      console.log('ERROR: ' + JSON.stringify(err))
      //respond with not found 404 to client
      response.writeHead(404);
      response.end(JSON.stringify(err))
      return
    }
    response.writeHead(200, {
      'Content-Type': get_mime(filePath)
    })
    response.end(data)
  })

}
//Socket Server
io.on('connection', function(socket) {
  console.log('client entered the site')
  //console.dir(socket)

  socket.emit('serverSays', '')
//-----base code from prof ends..---------

  //stores users in two unique databases
  socket.on('store-user', name => {
    //database for regular global chatting
    users_database[socket.id] = name
    //database for private and group chatting
    socket_database[socket.id] = {name: name, socket: socket}
    console.log(`${name} connected`)
  })

  //socket for receiving and emitting global msgs
  socket.on('clientSays', message => {
    console.log('RECEIVED: ' + message)
    //to broadcast message to everyone including sender:
    io.emit('serverSays', {message: message, name: users_database[socket.id]}) //broadcast to everyone including sender
  })

  //socket for receiving and emitting private and group chatting
  socket.on('privateClientSays', privMsg => {
    //get the values of the object passed in
    const recipients = privMsg.recipients
    const message = privMsg.message
    //searches the array recipients from chatClient
    recipients.forEach(element => {
      //emits the message to all those users with a socketId that matches the name
      for (let socketId in socket_database) {
        if (socket_database[socketId].name == element) {
          socket_database[socketId].socket.emit('privateServerSays', {
            message: message,
            name: socket_database[socket.id].name
          })
        }
      }
    })
    //emits the message to the sender as well
    socket.emit('privateServerSays', {
      message: message,
      name: socket_database[socket.id].name
    })
  })

  socket.on('disconnect', function(data) {
    //event emitted when a client disconnects
    console.log(`a client has left the site`)
    })
  })

console.log(`Server Running at port ${PORT}  CNTL-C to quit`)
console.log(`To Test:`)
console.log(`Open several browsers to: http://localhost:${PORT}/chatClient.html`)
