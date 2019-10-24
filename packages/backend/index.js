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

    users[userId] = {
        socket,
        userId,
        roomId,
        currentRoomId: roomId,
    }

    const toUsersInRoomId = (_roomId, callback) => {
        Object.keys(users).forEach(userName => {
            if (users[userName].currentRoomId === _roomId) {
                callback(userName)
            }
        })
    }

    // get room id that belongs to the user
    const emitRoomId = () => socket.emit('room-id', roomId)
    socket.on('req:room-id', function(data) {
        emitRoomId()
    })

    // get user id
    const emitUserId = () => socket.emit('user-id', userId)
    socket.on('req:user-id', function(data) {
        emitUserId()
    })

    // get users in current room
    const getUsersInRoom = () => {
        let usersInRoom = []

        toUsersInRoomId(users[userId].currentRoomId, userName => {
            usersInRoom.push(userName)
        })

        return usersInRoom
    }
    const emitUsersInRoom = () => {
        toUsersInRoomId(users[userId].currentRoomId, userName => {
            users[userId].socket.emit('users-in-room', getUsersInRoom())
        })
    }
    socket.on('req:users-in-room', function() {
        emitUsersInRoom()
    })

    const emitCodeChange = () => {
        toUsersInRoomId(users[userId].currentRoomId, userName => {
            users[userName].socket.emit('code-change', {
                user: userId,
                code: users[userId].code,
            })
        })
    }

    socket.on('code-change', function(code) {
        users[userId].code = code

        // send code change to all users in that room
        emitCodeChange()
    })

    const emitRoomChange = () =>
        socket.emit('room-change', {
            user: userId,
            code: users[userId].currentRoomId,
        })

    socket.on('room-change', function(roomId) {
        users[userId].currentRoomId = roomId
        emitRoomChange()
        emitUsersInRoom()
    })
})
