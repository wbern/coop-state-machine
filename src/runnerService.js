import sandbox from './sandbox'

export const runner = new (function() {
    this.set = function(code) {
        this.code = code
    }

    this.run = function() {
        return new Promise((resolve, reject) => {
            sandbox
                .postMessageWait('add-or-update-webworker', { name: 'mrX' })
                .then(a => {
                    // it works!
                    // TODO: make it run as well
                })
            // sandbox
            //     .runScript(this.code)
            //     .then(() => {
            //         console.log('this.run complete')
            //     })
            //     .catch(() => {
            //         console.warn('this.run complete, with errors')
            //     })
        })
    }
})()

export default runner
