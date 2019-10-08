self.onmessage = function(event) {
    if (event.data && event.data.name === 'tick') {
        let fn = data => {
            /* USER_CODE */

            // this will return if the user didn't return anything before that
            return null
        }

        let out = 'noop'

        try {
            out = fn(event.data)
        } catch (e) {
            out = 'choke'
        }

        self.postMessage(out)
    }
}
