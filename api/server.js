const express = require('express');
const path = require('path');

const app = express();
const httpServer = require('http').createServer(app);
const port = 8080;// httpserver port

app.use(express.static(path.join(__dirname, '../my-app/build')));
app.use(function(req, res) {
    res.status(404).send('404 NOT FOUND');
})

app.get('/', (req, res) => {
    //Send SPA to client...
    res.sendFile(path.join(__dirname, '../my-app/build/index.html'))
});

//httpServer
httpServer.listen(port, () => {
    console.log(`httpServer listening on *:${port}`);
});
