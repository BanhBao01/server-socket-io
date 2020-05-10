var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const https = require('https')


app.get('/', (req, res) => {
    console.log('rending website...')
    res.sendFile(__dirname + '/index.html');
});

var userConnection = []
io.on('connection', (socket) => {
    console.log(`${socket.id} connection`);
    console.log(userConnection)
    io.emit('SOCKET_ID', socket.id)

    socket.on('SOCKET_CONNECT', (auth) => {
        console.log(auth)
        userConnection.push({
            socket_id: socket.id,
            auth: auth
        })
        io.emit('LIST_CONNECT', userConnection)
    })

    socket.on('SOCKET_ON', (msg) => {
        console.log(userConnection)
        io.emit(msg.type, msg.data)
    });

    socket.on('SOCKET_ON_TO', (msg) => {
        console.log(userConnection)
        io.to(msg.id).emit(msg.type, msg.data)
    });

    socket.on('disconnect', (socket) => {
        console.log(socket.id)
        userConnection = userConnection.filter(item => {
            return item.socket_id != socket.id
        })
        io.emit('LIST_CONNECT', userConnection)
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

const port = process.env.PORT || 3000

http.listen(port, () => {
    console.log(`listening on *:${port}`);
});