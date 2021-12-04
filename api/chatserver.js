const express = require('express');
const app = express();
const { Pool } = require('pg')
const cors_url = process.env.SIMPLE_CHAT_CORS == undefined ? 'http://localhost:8080' : process.env.SIMPLE_CHAT_CORS
const poolUser = new Pool({
    user: 'postgres', 
    host: '172.18.0.2',
    database: 'postgres',
    password: '123',
    port: 5432 //db port
})
const poolRoom = new Pool({
    user: 'postgres', 
    host: '172.18.0.3',
    database: 'postgres',
    password: '123',
    port: 5432 //db port
})
const crypto = require('crypto');
const httpChatServer = require('http').createServer(app);
const port = 3002;// chatserver port

const io = require('socket.io')(httpChatServer, {
    cors: {
        origin: cors_url//http://123.123.123.123:8080
    }
});

async function getUserList(roomSecret){
    var participants
    const query={
        text: "SELECT participants FROM roomList WHERE secret='"+roomSecret+"'"
    }
    var participants = await poolRoom.query(query)   

    if(participants.rowCount == 0){
        participants = false
    }
    else{
        participants =  participants.rows[0].participants
    }
    return participants
    //pool.end()
}
function deleteUserFromUserlist(participant) {
    const query={
        text: "DELETE FROM userList WHERE id='"+participant+"'"
    }
    poolUser.query(query)
}
function deleteUserFromRoomlist(participant) {
    var query={
        text: "SELECT code,participants FROM roomList WHERE '"+participant+"' = ANY (participants)"
    }
    poolRoom.query(query,(err,res)=>{
        if(res.rowCount != 0){
            var participants = res.rows[0].participants
            var roomcode = res.rows[0].code
            participants.splice(participants.indexOf(participant),1)
            
            if(participants.length == 0){
                query={
                    text: "DELETE FROM roomList WHERE code='"+roomcode+"'"
                }
                poolRoom.query(query)
            }
            else{
                participants = participants.map(e => "'"+e+"'")
                query={
                    text: "UPDATE roomList SET participants=ARRAY["+participants+"] WHERE code='"+roomcode+"'"
                }
                poolRoom.query(query)
            }
        }  
    })
    
     
}
async function addUserToUserList(userId, userName){
    console.log(userId,userName)
    query={
        text: "INSERT INTO userList VALUES ('"+userId+"','"+userName+"')"
    }
    poolUser.query(query)
}
async function addUserToRoomlist(roomsecret, participant) {
    var participants
    var roomcode
    var query={
        text: "SELECT code,participants FROM roomList WHERE secret='"+roomsecret+"'"
    }
    var participants = await poolRoom.query(query)
    console.log(participants)
    if(participants != undefined){
        roomcode = participants.rows[0].code
        participants =participants.rows[0].participants
        
        if(participants == null){
            participants = []
        }
        console.log(participants)
        participants.push(participant)
        participants = participants.map(e => "'"+e+"'")
        query={
            text: "UPDATE roomList SET participants=ARRAY["+participants+"] WHERE code='"+roomcode+"'"
        }
        await poolRoom.query(query)
        return true
    }
    return false;
}
async function findUsername(id) {
    var id
    const query={
        text: "SELECT name FROM userList WHERE id='"+id+"'"
    }
    id = await poolUser.query(query)
    if(id.rowCount == 0){
        id = 'Player'
    }
    else{
        id = id.rows[0].name
    }
    return id
}
async function findUsernames(id_array) {
    var queries=''
    for(var i = 0; i < id_array.length; i++){
        console.log(id_array[i])
        queries += ("SELECT name FROM userList WHERE id='"+id_array[i]+"';")
    }
    
    const query={
        text: queries
    }
    var names = await poolUser.query(query)
    if(id_array.length != 1){
        names=names.map((e) =>{
            return e.rows[0].name
        })
    }
    else{
        names = [names.rows[0].name]
    }
    return names
}
async function FindRoomSecret(roomn, roomp) {
   
    query={
        text: "SELECT secret FROM roomList WHERE code='"+roomn+"' AND password='"+roomp+"'"
    }
    var roomSecret = await poolRoom.query(query)
    
    if(roomSecret.rowCount == 0){
        roomSecret = false
    }
    else{
        roomSecret = roomSecret.rows[0].secret
    }
    return roomSecret
    //pool.end()
}
async function roomCreate(roomCode, roomPassword, roomSecret){
    query={
        text: "INSERT INTO roomList VALUES('"+roomCode+"','"+roomPassword+"','"+roomSecret+"')"
    }
    var test = await poolRoom.query(query)
	
}

io.on('connection', (socket) => {
    console.log(socket.handshake.auth);
    console.log(socket.id)
    console.log('a user connected');
    //For debug
    socket.onAny((event, ...args) => {
        console.log(event, args);
    });

    socket.on('chat_message', (msg) => {
        //Get a chat message
        //Get user name by socket id(session)
        findUsername(socket.id).then((name) =>{
            const userName = name;
            const messageObject = {
                id: crypto.createHash('sha512').update(socket.id).digest('hex'),
                name: userName,
                message: msg
            }
            //Get the room number

            const participatingRoom = Array.from(socket.rooms)[1]
            //Send the message to sockets in the room
            io.to(participatingRoom).emit('chat_message', messageObject);
            console.log(`${messageObject.username} : ${messageObject.message}`)
        })
    })
    socket.on('room', (user_obj) => {
        const userName = user_obj.username;
        const userId = user_obj.id;
        const roomCode = user_obj.roomcode;
        const roomPassword = user_obj.roompw;
        
        //Check the room password 
           
        FindRoomSecret(roomCode,roomPassword).then((roomSecret)=>{
            if(roomSecret) {
                socket.join(roomSecret);
                socket.emit('room', true);
                //Add a user to userlist (store username)
                addUserToUserList(userId, userName).then(() =>{
                addUserToRoomlist(roomSecret, socket.id).then(() =>{
                getUserList(roomSecret).then(participants =>{
                findUsernames(participants).then(user_list =>{
                    io.to(roomSecret).emit('user_list', user_list)
                })})})})
            }
            else{
                socket.emit('room', false);
            }
        })
        //If the room password is correct
        //Join alert
        
    })
    socket.on('create_room', () => {
        const roomCode = crypto.randomBytes(8).toString('hex');
        const roomPassword = crypto.randomBytes(8).toString('hex');
        const roomSecret = crypto.randomBytes(8).toString('hex');
        
        //Add a user to roomlist
        roomCreate(roomCode,roomPassword, roomSecret)
        
        //addUserToRoomlist(roomSecret, socket.id);
        io.to(socket.id).emit('create_room', roomCode, roomPassword);
    })
    socket.on('disconnect', () => {
        //delete user from userlist
        deleteUserFromUserlist(socket.id);
        //delete user from roomlist
        deleteUserFromRoomlist(socket.id);
            
        console.log('user disconnect');
    })
}); 

//ChatServer
httpChatServer.listen(port, ()=> {
    console.log(`httpChatServer listening on *:${port}`);
})


