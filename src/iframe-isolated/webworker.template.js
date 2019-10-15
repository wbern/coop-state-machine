// this code is isolated by a sandboxed iframe, as well as a web worker
self.onmessage = function(event) {
    if (event.data && event.data.topic === 'tick') {
        const userFnWrapper = function(data) {
            // shadow some variables so they can't be accessed by user code
            const self = undefined
            const event = undefined
            const userFnWrapper = undefined
            const userFnOut = undefined

            /* USER_CODE */

            // user must have defined a main method

            // eslint-disable-next-line
            let result = main(data)

            if (Object.getOwnPropertyNames(result || {}).length > 0) {
                return result
            }
            return { action: 'skip' }
        }

        let userFnOut

        try {
            const filteredData = { ...event.data }
            delete filteredData.topic

            userFnOut = new userFnWrapper(filteredData)
        } catch (e) {
            userFnOut = { action: 'worker-error', error: e.toString() }
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
