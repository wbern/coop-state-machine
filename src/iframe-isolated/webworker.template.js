// this code is isolated by a sandboxed iframe, as well as a web worker
self.onmessage = function(event) {
    if (event.data && event.data.topic === 'tick') {
        let fn = function(data) {
            const state = {};

            if (
                event.data.state &&
                typeof event.data.state === 'object' &&
                event.data.state !== null &&
                Object.keys(event.data.state).length > 0
            ) {
                state = event.data.state;
            }

            // shadow some variables so they can't be accessed by user code
            const self = undefined;
            const event = undefined;

            /* USER_CODE */

            // this will return if the user didn't return anything before that
            return 'noop'
        }

        let out = 'noop'

        try {
            out = new fn(event.data)
        } catch (e) {
            out = 'choke'
        }

        self.postMessage(JSON.stringify({ topic: 'tick-ack', id: event.data.id, ackData: out }))
    }
}
