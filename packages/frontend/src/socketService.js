// Important note: socketService must interact
// with the vuex store for data that should be undo/redo-able

// import runnerService from './runnerService'
// import logService from './logService'

import io from 'socket.io-client'

export const socketService = new (function() {
    this.socket = io.connect('http://localhost:14337')

    this.sendRequest = function(message, data = { hello: 'world' }, timeout = 5000) {
        return new Promise((resolve, reject) => {
            let timedOut = false

            this.socket.emit('room-id', data, function(data) {
                // args are sent in order to acknowledgement function
                if (!timedOut) {
                    resolve(data)
                }
            })
            // this.socket.emit(message, data, function(data) {
            //     // args are sent in order to acknowledgement function
            // })

            setTimeout(() => {
                timedOut = true
                reject('request timed out')
            }, 5000)
        })
    }
})()

window.socketService = socketService
export default socketService
