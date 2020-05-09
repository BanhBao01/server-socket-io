var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const https = require('https')

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    console.log(`${socket.id} connection`);
    socket.on('CHAT_MESSAGE', (msg) => {
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
        console.log(msg, options)
        const req = https.request(options, (res) => {
            console.log(`statusCode: ${res.statusCode}`)

            res.on('data', (d) => {
                io.emit('CHAT_MESSAGE', d)
            })
        })

        req.on('error', (error) => {
            console.error(error)
            io.emit('CHAT_MESSAGE', error)
        })

        // req.end()
    });
});

const port = process.env.PORT || 3000

http.listen(port, () => {
    console.log(`listening on *:${port}`);
});