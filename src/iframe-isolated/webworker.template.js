// this code is isolated by a sandboxed iframe, as well as a web worker
self.onmessage = function(event) {
    if (event.data && event.data.topic === 'tick') {
        const fn = function(data) {
            // shadow some variables so they can't be accessed by user code
            const self = undefined
            const event = undefined

            // data is available via "this"
            let out = 'noop';

            let userFn = 'USER_CODE'

            return userFn(data);
        }

        let out = 'noop'

        try {
            const filteredData = { ...event.data }
            delete filteredData.topic

            out = new fn(filteredData) || 'noop';
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
