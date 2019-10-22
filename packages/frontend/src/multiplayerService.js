// Important note: multiplayerService must interact
// with the vuex store for data that should be undo/redo-able

import { fromEvent, Observable, BehaviorSubject } from 'rxjs'

// import runnerService from './runnerService'
import socketService from './socketService'

export const multiplayerService = new (function() {
    const createObserver = (eventName, defaultValue) => {
        let o = new BehaviorSubject(defaultValue)
        fromEvent(socketService.socket, eventName).subscribe(v => {
            o.next(v)
        })

        return o
    }

    this.onRoomId = createObserver('room-id', null)
    this.onCurrentRoomId = createObserver('current-room-id', null)
    this.onUsersInRoom = createObserver('users-in-room', [])

    this.requestMyRoomId = function() {
        return socketService.sendRequest('room-id')
    }

    this.requestPlayersInCurrentRoom = function() {
        return socketService.sendRequest('users-in-room')
    }

    // setup
    this.requestMyRoomId()
    this.requestPlayersInCurrentRoom()
})()

window.multiplayerService = multiplayerService
export default multiplayerService
