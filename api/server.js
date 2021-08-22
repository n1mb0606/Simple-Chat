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
        origin: "http://localhost:8080"//http://123.123.123.123:8080
    }
});

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

function deleteUserFromUserlist(participant) {
    for(let i = 0; i < USERLIST.length; i++){
        if(USERLIST[i].id == participant){
            USERLIST.splice(i, 1);
        }
    }
}
function deleteUserFromRoomlist(participant) {
    let i = 0;
    while(i < ROOMLIST.length) {
        //delete user from roomlist
        if(ROOMLIST[i].roomparticipants.has(participant)){
            ROOMLIST[i].roomparticipants.delete(participant);
            //check is room empty
            if(!ROOMLIST[i].roomparticipants.size){
                console.log(ROOMLIST[i].roomcode, 'deleted');
                ROOMLIST.splice(i, 1);
            }else{
                i++;
            }
        }
        else{
            i++;
        }
    }      
}
function addUserToRoomlist(roomsecret, participant) {
    for(let i = 0; i < ROOMLIST.length; i++){
        if(ROOMLIST[i].roomsecret == roomsecret){
            ROOMLIST[i].roomparticipants.add(participant)
            return true;
        }
    }
    return false;
}
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
            //Add a user to userlist
            USERLIST.push({
                id: userId,
                userName: userName
            });
            //Add a user to roomlist
            addUserToRoomlist(roomSecret, socket.id);
            console.log('roomlist', ROOMLIST);
        }
        else{
            socket.emit('room', false);
        }
        //Join alert
        
    })
    socket.on('create_room', () => {
        const roomCode = crypto.randomBytes(8).toString('hex');
        const roomPassword = crypto.randomBytes(8).toString('hex');
        const roomSecret = crypto.randomBytes(8).toString('hex');
        ROOMLIST.push({roomcode: roomCode, 
                       roompw: roomPassword, 
                       roomsecret: roomSecret,
                       roomparticipants: new Set()
                    });
        console.log(ROOMLIST);
        //Add a user to roomlist
        addUserToRoomlist(roomSecret, socket.id);
        io.emit('create_room', roomCode, roomPassword);
    })
    socket.on('disconnect', () => {
        //delete user from userlist
        deleteUserFromUserlist(socket.id);
        //delete user from roomlist
        deleteUserFromRoomlist(socket.id);
              

        console.log('roomlist',ROOMLIST);
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