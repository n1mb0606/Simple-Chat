const express = require('express');
const path = require('path');
const crypto = require('crypto');


const app = express();
const httpServer = require('http').createServer(app);
const httpChatServer = require('http').createServer(app);

//const api = require('./routes/index');
const port1 = 8080;// httpserver port
const port2 = 3002;// chatserver port

const io = require('socket.io')(httpChatServer, {
    cors: {
        origin: "http://localhost:8080"
    }
});
const jwt = require('jsonwebtoken');
var USERLIST = [];
var ROOMLIST = [];
//var ROOMSECRET = '';
// app.use('/api',api);
// app.get('/api', (req, res) => {
//     console.log('GET')
// })
// app.post('/api', (req, res) => {
//     console.log('POST');
// })

function findUsername(id) {
    for(let i = 0; i < USERLIST.length; i++){
        if(USERLIST[i].id == id){
            return USERLIST[i].userName;
        }
    }
    return 'Player';
}
function FindRoomSecret(roomn, roomp) {
    for(let i = 0; i < ROOMLIST.length; i++) {
        if(ROOMLIST[i].roomcode == roomn){
            if(ROOMLIST[i].roompw == roomp){
                return ROOMLIST[i].roomsecret
            }
        }
    }
    return false;
}
app.use(express.static(path.join(__dirname, '../my-app/build')));
app.use(function(req, res) {
    res.status(404).send('404 NOT FOUND');
})
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../my-app/build/index.html'))
});
app.get('/chat', (req, res) => {
    res.sendFile(path.join(__dirname, '../my-app/build/index.html'))
});
app.get('/room', (req, res) => {
    res.sendFile(path.join(__dirname, '../my-app/build/index.html'))
})

io.on('connection', (socket) => {
    console.log(socket.handshake.auth);
    console.log('a user connected');
    socket.onAny((event, ...args) => {
        console.log(event, args);
    });

    socket.on('chat_message', (msg) => {
        const userName = findUsername(socket.id);
        const messageObject = {
            id: crypto.createHash('sha512').update(socket.id).digest('hex'),
            name: userName,
            message: msg
        }
        const participatingRoom = Array.from(socket.rooms)[1];
        console.log("rooms", participatingRoom);

        io.to(participatingRoom).emit('chat_message', messageObject);
        console.log(`${messageObject.username} : ${messageObject.message}`);
    })
    socket.on('room', (user_obj) => {
        //const userInfo = socket.handshake.auth;
        const userName = user_obj.username;
        const userId = user_obj.id;
        const roomCode = user_obj.roomcode;
        const roomPassword = user_obj.roompw;

        const roomSecret = FindRoomSecret(roomCode, roomPassword);
        //console.log('userinfo',userInfo.rc, userinfo.rp);
        if(roomSecret) {
            socket.join(roomSecret);
            socket.emit('room', true);
            
            USERLIST.push({
                id: userId,
                userName: userName
            });
            
            console.log('true');
        }
        else{
            socket.emit('room', false);
            console.log('false');
        }
        //Join alert
        
    })
    socket.on('create_room', () => {
        const roomCode = crypto.randomBytes(8).toString('hex');
        const roomPassword = crypto.randomBytes(8).toString('hex');
        const roomSecret = crypto.randomBytes(8).toString('hex');
        ROOMLIST.push({roomcode: roomCode, 
                       roompw: roomPassword, 
                       roomsecret: roomSecret});
        console.log(ROOMLIST);
        io.emit('create_room', roomCode, roomPassword);
    })
    socket.on('disconnect', () => {
        //delete user
        for(let i = 0; i < USERLIST.length; i++){
            if(USERLIST[i].id == socket.id){
                USERLIST.splice(i, 1);
            }
        }
        console.log('user disconnect');
    })
}); 
//httpServer
httpServer.listen(port1, () => {
    console.log(`httpServer listening on *:${port1}`);
});
//ChatServer
httpChatServer.listen(port2, ()=> {
    console.log(`httpChatServer listening on *:${port2}`);
})