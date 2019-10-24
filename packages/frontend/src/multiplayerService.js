// Important note: multiplayerService must interact
// with the vuex store for data that should be undo/redo-able

import { fromEvent, Observable, BehaviorSubject } from 'rxjs'

// import runnerService from './runnerService'
import socketService from './socketService'

export const multiplayerService = new (function() {
    const createObserver = eventName =>
        fromEvent(socketService.socket, eventName)

    const createBehaviorSubject = (eventName, defaultValue) => {
        let o = new BehaviorSubject(defaultValue)
        createObserver(eventName).subscribe(v => {
            o.next(v)
        })
        return o
    }

    this.onRoomId = createBehaviorSubject('room-id', null)
    this.onUserId = createObserver('user-id')
    this.onCurrentRoomId = createBehaviorSubject('current-room-id', null)
    this.onUsersInRoom = createBehaviorSubject('users-in-room', [])
    this.onCodeChange = createObserver('code-change')

    this.requestUserId = function() {
        socketService.sendRequest('user-id')
    }

    this.requestMyRoomId = function() {
        socketService.sendRequest('room-id')
    }

    this.requestPlayersInCurrentRoom = function() {
        socketService.sendRequest('users-in-room')
    }

    this.sendCodeChange = function(code) {
        socketService.send('code-change', code)
    }

    this.sendRoomChange = function(roomId) {
        socketService.send('room-change', roomId)
    }

    // setup
    this.requestUserId()
    this.requestMyRoomId()
    this.requestPlayersInCurrentRoom()
})()

window.multiplayerService = multiplayerService
export default multiplayerService
