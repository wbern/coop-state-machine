import sandbox from './sandbox'

export const runnerService = new (function() {
    this.ticks = 0

    // store changes  might be need to be moved out later
    // to some type of compute service.. for now, keep it here
    this.configureStore = function(store) {
        this.store = store
    }

    this.tick = function() {
        let tickOneWorkerUntilAllTicked = () =>
            sandbox.postMessageWait('tick-one-worker').then(data => {
                // need to handle the response and update the
                // state we want to send in
                debugger;

                if (data.allWorkersTicked === true) {
                    // all done
                    return true
                } else if (data.allWorkersTicked === false) {
                    return tickOneWorkerUntilAllTicked()
                }
            })

        return tickOneWorkerUntilAllTicked().then(() => {
            // all were ticked
            debugger;
        })
    }

    this.canTick = function() {
        return sandbox.doesSandboxExist();
    }

    this.setup = function(name = 'mrX', workerCode) {
        return new Promise((resolve, reject) => {
            sandbox.postMessageWait('add-or-update-webworker', {
                name,
                workerCode,
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

window.runnerService = runnerService
export default runnerService
