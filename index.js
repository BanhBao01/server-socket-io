var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const https = require('https')

app.get('/', (req, res) => {
    console.log('rending website...')
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    console.log(`${socket.id} connection`);
    io.emit('SOCKET_ID', socket.id)
    socket.on('SOCKET_ON', (msg) => {
        io.emit(msg.type, msg.data)
    });
    socket.on('CHAT_MESSAGE_GROUP', (msg) => {
        handleEmitSocket('CHAT_MESSAGE_GROUP', msg)
    });
});

function startKeepAlive() {
    setInterval(function() {
        var options = {
            host: 'server-socket-io0.herokuapp.com',
            port: 443,
            path: '/'
        };
        https.get(options, function(res) {
            res.on('data', function(chunk) {
                try {
                    // optional logging... disable after it's working
                    console.log("HEROKU RESPONSE: render side...");
                } catch (err) {
                    console.log(err.message);
                }
            });
        }).on('error', function(err) {
            console.log("Error: " + err.message);
        });
    }, 20 * 60 * 1000); // load every 20 minutes
}

startKeepAlive();

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