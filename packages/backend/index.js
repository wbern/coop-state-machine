import express, { static } from 'express'
const app = express()
import httpModule from 'http';
const http = .createServer(app)
const io = require('socket.io')(http)
import fs from 'fs'
import { join } from 'path'
import crypto from 'crypto'
import generateName from 'sillyname'

const serveOptions = {
    setHeaders: (res, path, stat) => {
        res.header('Access-Control-Allow-Origin', '*')
        res.header(
            'Access-Control-Allow-Methods',
            'GET, POST, PUT, DELETE, PATCH, OPTIONS'
        )
        res.header(
            'Access-Control-Allow-Headers',
            'X-Requested-With, content-type, Authorization'
        ),
            res.header(
                'Cache-Control',
                'private, no-cache, no-store, must-revalidate'
            )
        res.header('Expires', '-1')
        res.header('Pragma', 'no-cache')
    },
}

app.use(
    '/',
    static(join(__dirname, '../frontend/dist/'), serveOptions)
)
app.use(
    '/',
    static(join(__dirname, '../frontend/public/'), serveOptions)
)
// app.get('/', function(req, res) {
//     res.sendFile(path.join(__dirname, '../frontend/dist/index.html'))
// })

http.listen(process.env.PORT || 8080)

const users = {}

const gameState = {
    worldCoords: createWorldCoords(),
    worldSettings: {
        initialSizeX: 0,
        initialSizeY: 0,
        maxSizeX: 4,
        maxSizeY: 6,
        initialFloors: 0,
        randomizeBuildings: false,
    },
    playerStates: {},
    currentTurn: 0,
}

io.on('connection', function (socket) {
    // const secret = '' + socket.id + Math.floor(Math.random() * 100000)
    // const getHash = (seed) =>
    //     crypto
    //         .createHmac('sha256', secret)
    //         .update(secret + seed)
    //         .digest('hex')
    //         .substr(0, 8)

    const userId = generateName()
    // const roomId = getHash('roomId')
    const roomId = 'all'

    users[userId] = {
        socket,
        userId,
        roomId,
        currentRoomId: roomId,
    }

    const toUsersInRoomId = (_roomId, callback) => {
        Object.keys(users).forEach((userName) => {
            if (users[userName].currentRoomId === _roomId) {
                callback(userName)
            }
        })
    }

    // get room id that belongs to the user
    const emitRoomId = () => socket.emit('room-id', roomId)
    socket.on('req:room-id', function (data) {
        emitRoomId()
    })

    socket.on('req:set-code', function (code) {
        users[userId].code = code
    })

    // get user id
    const emitUserId = () => socket.emit('user-id', userId)
    socket.on('req:user-id', function (data) {
        emitUserId()
    })

    // get users in current room
    const getUsersInRoom = () => {
        let usersInRoom = []

        toUsersInRoomId(users[userId].currentRoomId, (userName) => {
            usersInRoom.push(
                Object.assign({}, users[userName], { socket: undefined })
            )
        })

        return usersInRoom
    }
    const emitUsersInRoom = () => {
        toUsersInRoomId(users[userId].currentRoomId, (userName) => {
            users[userName].socket.emit('users-in-room', getUsersInRoom())
        })
    }
    socket.on('req:users-in-room', function () {
        emitUsersInRoom()
    })

    const emitCodeChange = () => {
        toUsersInRoomId(users[userId].currentRoomId, (userName) => {
            users[userName].socket.emit('code-change', {
                user: userId,
                code: users[userId].code,
            })
        })
    }

    // old
    socket.on('code-change', function (code) {
        users[userId].code = code

        // send code change to all users in that room
        emitCodeChange()
    })

    // old
    // const emitRoomChange = () =>
    //     socket.emit('room-change', {
    //         user: userId,
    //         code: users[userId].currentRoomId,
    //     })

    // old
    socket.on('room-change', function (data) {
        users[userId].currentRoomId = data.roomId
        users[userId].code = data.code || users[userId].code
        // emitRoomChange()
        emitUsersInRoom()
    })
})
