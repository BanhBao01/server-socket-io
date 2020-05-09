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
        const req = https.request(options, (res) => {
            console.log(`statusCode: ${res.statusCode}`)

            res.on('data', (d) => {
                process.stdout.write(d)
            })
        })

        req.on('error', (error) => {
            console.error(error)
        })

        req.write(data)
        req.end()
    });
});

http.listen(3000, () => {
    console.log('listening on *:3000');
});