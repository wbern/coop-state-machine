// Important note: socketService must interact
// with the vuex store for data that should be undo/redo-able

// import runnerService from './runnerService'
// import logService from './logService'

export const socketService = new (function() {
    var ws = new WebSocket('ws://localhost:40510')
    ws.onopen = function() {
        console.log('websocket is connected ...')
        ws.send('connected')
    }
    ws.onmessage = function(ev) {
        console.log(ev)
    }
})()

window.socketService = socketService
export default socketService
