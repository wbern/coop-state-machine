// this code is isolated by a sandboxed iframe, as well as a web worker
self.onmessage = function(event) {
    if (event.data && event.data.topic === 'tick') {
        const userFnWrapper = function(gameState, playerState, lastAction) {
            // shadow some variables so they can't be accessed by user code
            const self = undefined
            const event = undefined
            const userFnWrapper = undefined
            const userFnOut = undefined

            // YOUR CODE STARTS HERE

            /* USER_CODE */

            // END OF YOUR CODE

            // user must have defined a main method

            // eslint-disable-next-line
            let result = main(gameState, playerState, lastAction)

            if (Object.getOwnPropertyNames(result || {}).length > 0) {
                return result
            }
            return { action: 'skip' }
        }

        let userFnOut

        try {
            const filteredGameState = { ...event.data.state }
            // not sure why these are present
            delete filteredGameState.topic
            delete filteredGameState.id

            let playerStates = event.data.state.playerStates || {}
            let playerState = playerStates[event.data.name] || {}

            let playerActions = playerState.actions || []
            let lastAction =
                playerActions.length > 0
                    ? playerActions[playerActions.length - 1]
                    : null

            userFnOut = new userFnWrapper(
                filteredGameState,
                playerState,
                lastAction
            )
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
