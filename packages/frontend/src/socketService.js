// Important note: socketService must interact
// with the vuex store for data that should be undo/redo-able

// import runnerService from './runnerService'
// import logService from './logService'

import io from 'socket.io-client'

export const socketService = new (function() {
    this.socket = io.connect('http://localhost:14337')

    this.sendRequest = function(message, data) {
        this.socket.emit('req:' + message, data)
    }
})()

window.socketService = socketService
export default socketService
