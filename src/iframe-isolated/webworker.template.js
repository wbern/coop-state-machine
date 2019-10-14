// this code is isolated by a sandboxed iframe, as well as a web worker
self.onmessage = function(event) {
    if (event.data && event.data.topic === 'tick') {
        const fn = function() {
            // shadow some variables so they can't be accessed by user code
            const self = undefined
            const event = undefined

            // data is available via "this"

            /* USER_CODE */

            // this will return if the user didn't return anything before that
            return 'noop'
        }

        let out = 'noop'

        try {
            const dataToBind = { ...event.data }
            delete dataToBind.topic

            out = fn.call(dataToBind)
        } catch (e) {
            out = { type: 'worker-error', error: e.toString() }
        }

        self.postMessage(
            JSON.stringify({
                topic: 'tick-ack',
                id: event.data.id,
                ackData: out,
            })
        )
    }
}
