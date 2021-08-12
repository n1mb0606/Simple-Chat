const express = require('express');
const path = require('path');

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

var USERLIST = [];
// app.use('/api',api);
// app.get('/api', (req, res) => {
//     console.log('GET')
// })
// app.post('/api', (req, res) => {
//     console.log('POST');
// })
function FindUsrName(id) {
    for(let i = 0; i < USERLIST.length; i++){
        if(USERLIST[i].id == id){
            return USERLIST[i].name;
        }
    }
    return 'Player';
}
app.use(express.static(path.join(__dirname, '../my-app/build')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../my-app/build/index.html'))
});
app.get('/chat', (req, res) => {
    res.sendFile(path.join(__dirname, '../my-app/build/index.html'))
});

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.onAny((event, ...args) => {
        console.log(event, args);
    });

    socket.on('chat message', (msg) => {
        const usrname = FindUsrName(socket.id);
        const msg_obj = {
            name: usrname,
            msg: msg
        }
        io.emit('chat message', msg_obj);
        //socket.broadcast.emit('hi');
        console.log('msg : ', msg);
    })

    socket.on('user', (user) => {
        const username = user.username;
        const socketid = user.id;

        //create user
        USERLIST.push({
            id: socketid,
            name: username
        });

        broadcast_msg = {
            name: '관리자',
            msg: username + '님이 입장하셨습니다.'
        }
        socket.broadcast.emit('chat message', broadcast_msg);
        io.emit('user', );
        console.log(`username: ${username}`);
        console.log(`socketid: ${socketid}`);

        for(let i = 0; i < USERLIST.length; i++){
            console.log(USERLIST[i]);
        }
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