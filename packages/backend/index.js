const app = require('http').createServer(handler)
const io = require('socket.io')(app)
const fs = require('fs')
const crypto = require('crypto')

app.listen(14337)

function handler(req, res) {
    // fs.readFile(__dirname + '/index.html', function(err, data) {
    //     if (err) {
    //         res.writeHead(500)
    //         return res.end('Error loading index.html')
    //     }
    //     res.writeHead(200)
    //     res.end(data)
    // })
}

const users = {}

io.on('connection', function(socket) {
    const secret = '' + socket.id + Math.floor(Math.random() * 100000)
    const getHash = seed =>
        crypto
            .createHmac('sha256', secret)
            .update(secret + seed)
            .digest('hex')
            .substr(0, 8)

    const userId = getHash('userId')
    const roomId = getHash('roomId')

    // users[userId] = {
    //     roomId,
    // }

    socket.on('room-id', function(name, fn) {
        fn(roomId)
    })
})
