// Important note: multiplayerService must interact
// with the vuex store for data that should be undo/redo-able

// import runnerService from './runnerService'
import socketService from './socketService'

export const multiplayerService = new (function() {
    this.getRoomId = function() {
        return socketService.sendRequest('room-id')
    }
})()

window.multiplayerService = multiplayerService
export default multiplayerService
