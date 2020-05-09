var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const https = require('https')
const herokuNoSleep = require('heroku-nosleep')('https://server-socket-io0.herokuapp.com/')

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    console.log(`${socket.id} connection`);
    io.emit('SOCKET_ID', socket.id)
    socket.on('CHAT_MESSAGE', (msg) => {
        handleEmitSocket('CHAT_MESSAGE', msg)
    });
    socket.on('CHAT_MESSAGE_GROUP', (msg) => {
        handleEmitSocket('CHAT_MESSAGE_GROUP', msg)
    });
});

function handleEmitSocket(type, msg) {
    const data = JSON.stringify(msg.data)
    const options = {
        hostname: msg.options.hostname,
        port: msg.options.port,
        path: msg.options.path,
        method: msg.options.method,
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    }
    const req = https.request(options, (res) => {
        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', (d) => {
            io.emit(type, d)
        })
    })

    req.on('error', (error) => {
        console.error(error.message)
    })

    req.write(data)
    req.end()
}

const port = process.env.PORT || 3000

http.listen(port, () => {
    console.log(`listening on *:${port}`);
});