// Important note: socketService must interact
// with the vuex store for data that should be undo/redo-able

// import runnerService from './runnerService'
// import logService from './logService'

import io from 'socket.io-client'
import { BehaviorSubject } from 'rxjs'

export const socketService = new (function() {
    this.socket = io.connect(
        window.WEBSOCKET_PORT
            ? window.location.origin.replace(
                  /:[0-9]+|$/,
                  ':' + window.WEBSOCKET_PORT
              )
            : window.location.origin
    )

    this.connectedChange = new BehaviorSubject(false)

    this.socket.on('connect', () => {
        this.connectedChange.next(this.socket.connected) // true
    })

    this.socket.on('disconnect', () => {
        // this.socket.open()
        this.connectedChange.next(this.socket.connected) // true
    })

    this.sendRequest = function(message, data) {
        this.socket.emit('req:' + message, data)
    }

    this.send = function(message, data) {
        this.socket.emit(message, data)
    }
})()

window.socketService = socketService
export default socketService
