// this code is isolated by a sandboxed iframe, as well as a web worker
self.onmessage = function(event) {
    if (event.data && event.data.topic === 'tick') {
        const userFnWrapper = function(data) {
            // shadow some variables so they can't be accessed by user code
            const self = undefined
            const event = undefined
            const userFnWrapper = undefined
            const userFnOut = undefined

            let userFn = 'USER_CODE'

            return userFn(data)
        }

        let userFnOut = { type: 'skip' }

        try {
            const filteredData = { ...event.data }
            delete filteredData.topic

            userFnOut = new userFnWrapper().constructor(filteredData) || 'noop'
        } catch (e) {
            userFnOut = { type: 'worker-error', error: e.toString() }
        }

        self.postMessage(
            JSON.stringify({
                topic: 'tick-ack',
                id: event.data.id,
                ackData: userFnOut,
            })
        )
    }
}
