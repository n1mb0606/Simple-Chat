const express = require('express');
const path = require('path')
const app = express(),
            bodyParser = require('body-parser');
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const api = require('./routes/index');
const port = 3002;

//app.use('/api',api);
app.use(express.static(path.join(__dirname, '../my-app/build')));

app.get('/api', (req, res) => {
    console.log('GET')
})
app.post('/api', (req, res) => {
    console.log('POST');
})

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../my-app/build/index.html'))
})
io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
        //socket.broadcast.emit('hi');
        console.log('msg : ', msg);
    })
    socket.on('disconnect', () => {
        console.log('user disconnect');
    })
})
server.listen(port, () => {
    console.log(`listening on *:${port}`);
});